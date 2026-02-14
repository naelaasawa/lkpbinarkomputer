import { prisma as db } from "@/lib/prisma";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ImportedCourseData = any;

// Returns array of imported course IDs
export async function importCoursesFromZip(zipBuffer: Buffer, userId: string): Promise<string[]> {
    const zip = new AdmZip(zipBuffer);

    // 1. Extract to temp dir
    const tempDir = path.join(process.cwd(), "tmp", `import_${Date.now()}`);
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    zip.extractAllTo(tempDir, true);

    // 2. Determine if single or bulk
    let coursesData: ImportedCourseData[] = [];

    const singleCoursePath = path.join(tempDir, "course.json");
    const bulkCoursesPath = path.join(tempDir, "courses.json");

    if (fs.existsSync(bulkCoursesPath)) {
        coursesData = JSON.parse(fs.readFileSync(bulkCoursesPath, "utf-8"));
    } else if (fs.existsSync(singleCoursePath)) {
        coursesData = [JSON.parse(fs.readFileSync(singleCoursePath, "utf-8"))];
    } else {
        throw new Error("Invalid archive: missing course.json or courses.json");
    }

    // 3. Prepare assets destination
    const publicUploadsDir = path.join(process.cwd(), "public", "uploads", "imported", `${Date.now()}`);
    if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
    }

    // 4. Move assets and create mapping
    const assetsDir = path.join(tempDir, "assets");
    const assetMapping = new Map<string, string>();

    if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        for (const file of files) {
            const sourcePath = path.join(assetsDir, file);
            const startDestPath = path.join(publicUploadsDir, file);

            // Move file
            fs.renameSync(sourcePath, startDestPath);

            const relativeOldPath = `assets/${file}`;
            const publicNewPath = `/uploads/imported/${path.basename(publicUploadsDir)}/${file}`;
            assetMapping.set(relativeOldPath, publicNewPath);
        }
    }

    // Helper to replace paths
    const replacePath = (content: string | null): string | null => {
        if (!content) return null;
        let newContent = content;

        assetMapping.forEach((newPath, oldPath) => {
            newContent = newContent!.replace(new RegExp(oldPath, 'g'), newPath);
            newContent = newContent!.replace(new RegExp(`/${oldPath}`, 'g'), newPath);
        });

        return newContent;
    };

    const importedIds: string[] = [];

    // 5. Create Database Records for each course
    for (const courseData of coursesData) {
        let categoryId = courseData.categoryId;
        if (courseData.category) {
            const existingCategory = await db.category.findUnique({
                where: { name: courseData.category.name }
            });
            if (existingCategory) {
                categoryId = existingCategory.id;
            } else {
                try {
                    const newCat = await db.category.create({
                        data: {
                            name: courseData.category.name,
                            icon: courseData.category.icon || "Book",
                            color: courseData.category.color || "#000000"
                        }
                    });
                    categoryId = newCat.id;
                } catch (e) {
                    const firstCat = await db.category.findFirst();
                    if (firstCat) categoryId = firstCat.id;
                }
            }
        }

        const createdCourse = await db.course.create({
            data: {
                title: courseData.title + " (Imported)",
                description: replacePath(courseData.description) || "",
                fullDescription: replacePath(courseData.fullDescription),
                shortDescription: replacePath(courseData.shortDescription),
                imageUrl: replacePath(courseData.imageUrl),
                price: Number(courseData.price) || 0,
                level: courseData.level,
                language: courseData.language,
                categoryId: categoryId,
                published: false,
                enrollmentType: courseData.enrollmentType,
                completionRule: courseData.completionRule,
                whatYouLearn: courseData.whatYouLearn,
                modules: {
                    create: courseData.modules.map((module: any) => ({
                        title: module.title,
                        description: module.description,
                        order: module.order,
                        lessons: {
                            create: module.lessons.map((lesson: any) => ({
                                title: lesson.title,
                                contentType: lesson.contentType,
                                content: replacePath(lesson.content),
                                order: lesson.order,
                                duration: lesson.duration || 0,
                                quiz: lesson.quiz ? {
                                    create: {
                                        title: lesson.quiz.title,
                                        description: lesson.quiz.description,
                                        type: lesson.quiz.type,
                                        passingScore: lesson.quiz.passingScore,
                                        timeLimit: lesson.quiz.timeLimit,
                                        questions: {
                                            create: lesson.quiz.questions.map((q: any) => ({
                                                question: q.question,
                                                correctAnswer: q.correctAnswer,
                                                options: q.options,
                                                type: q.type,
                                                explanation: q.explanation,
                                                order: q.order,
                                                score: q.score
                                            }))
                                        }
                                    }
                                } : undefined
                            }))
                        }
                    }))
                }
            }
        });
        importedIds.push(createdCourse.id);
    }

    // Clean up temp
    fs.rmSync(tempDir, { recursive: true, force: true });

    return importedIds;
}

// Wrapper for backward compatibility (returns single ID)
export async function importCourseFromZip(zipBuffer: Buffer, userId: string): Promise<string> {
    const ids = await importCoursesFromZip(zipBuffer, userId);
    return ids[0];
}
