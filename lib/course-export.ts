import { prisma as db } from "@/lib/prisma";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

// export function exportCourseToZip is deprecated in favor of this, 
// but we can keep a wrapper if needed. 
// For now, let's just make this the main function.

export async function exportCoursesToZip(courseIds: string[]): Promise<string> {
    if (!courseIds.length) throw new Error("No course IDs provided");

    // 1. Fetch all courses
    const courses = await db.course.findMany({
        where: { id: { in: courseIds } },
        include: {
            category: true,
            modules: {
                orderBy: { order: "asc" },
                include: {
                    lessons: {
                        orderBy: { order: "asc" },
                        include: {
                            quiz: {
                                include: {
                                    questions: {
                                        orderBy: { order: "asc" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!courses.length) {
        throw new Error("No courses found");
    }

    // 2. Prepare temporary directory
    const tempDir = path.join(process.cwd(), "tmp", `export_bulk_${Date.now()}`);
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const assetsDir = path.join(tempDir, "assets");
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir);
    }

    // 3. Process assets for ALL courses
    const assetsToZip: { source: string; destination: string }[] = [];

    // Helper to process a file path/url
    // We need to keep this pure, so it returns the new path string
    const processAsset = (url: string | null): string | null => {
        if (!url) return null;
        if (!url.startsWith("/")) return url;

        const publicPath = path.join(process.cwd(), "public");
        const relativePath = url.startsWith("/") ? url.substring(1) : url;
        const fullSourcePath = path.join(publicPath, relativePath);

        if (fs.existsSync(fullSourcePath)) {
            const fileName = path.basename(fullSourcePath);

            // Deduplicate filename for zip destination
            let destFileName = fileName;
            let counter = 1;
            // distinct check: if we already have this source queued for this destination, reuse it?
            // actually if source is same, destination should be same.
            // if source is different but filename same, destination should change.

            const existingAsset = assetsToZip.find(a => a.source === fullSourcePath);
            if (existingAsset) {
                return `assets/${existingAsset.destination}`;
            }

            while (assetsToZip.some(a => a.destination === destFileName)) {
                const nameParts = fileName.split('.');
                const ext = nameParts.pop();
                const name = nameParts.join('.');
                destFileName = `${name}_${counter}.${ext}`;
                counter++;
            }

            assetsToZip.push({
                source: fullSourcePath,
                destination: destFileName
            });

            return `assets/${destFileName}`;
        }

        return url;
    };

    // Helper regex
    const processHtmlContent = (html: string | null): string | null => {
        if (!html) return null;
        return html.replace(/src=["'](\/uploads\/[^"']+)["']/g, (match, src) => {
            const newPath = processAsset(src);
            return `src="${newPath}"`;
        });
    };

    // Process each course
    for (const course of courses) {
        course.imageUrl = processAsset(course.imageUrl);

        for (const module of course.modules) {
            for (const lesson of module.lessons) {
                if (lesson.contentType === "text" || lesson.contentType === "article") {
                    lesson.content = processHtmlContent(lesson.content);
                } else if (["video", "file", "pdf"].includes(lesson.contentType)) {
                    if (lesson.content && lesson.content.startsWith("/")) {
                        lesson.content = processAsset(lesson.content);
                    }
                }
            }
        }
    }

    // 4. Write courses.json (Plural)
    const coursesJsonPath = path.join(tempDir, "courses.json");
    fs.writeFileSync(coursesJsonPath, JSON.stringify(courses, null, 2));

    // 5. Create ZIP
    const zip = new AdmZip();
    zip.addLocalFile(coursesJsonPath);

    // Add assets
    for (const asset of assetsToZip) {
        zip.addLocalFile(asset.source, "assets", asset.destination);
    }

    const zipFilePath = path.join(process.cwd(), "tmp", `courses_bulk_export_${Date.now()}.zip`);
    zip.writeZip(zipFilePath);

    // 6. Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    return zipFilePath;
}

// Wrapper for single course backward compatibility if needed
export async function exportCourseToZip(courseId: string): Promise<string> {
    return exportCoursesToZip([courseId]);
}
