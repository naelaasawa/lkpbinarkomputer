
import { prisma } from "../lib/prisma";
import { exportCoursesToZip } from "../lib/course-export";
import { importCoursesFromZip } from "../lib/course-import";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Starting Bulk Export/Import Test...");

    // 1. Get a user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found. Please seed the database first.");
        return;
    }
    console.log(`Using user: ${user.email} (${user.id})`);

    // 2. Create dummy courses
    console.log("Creating dummy courses...");
    const course1 = await prisma.course.create({
        data: {
            title: `Bulk Course 1 ${Date.now()}`,
            description: "Course 1 Desc",
            price: 50000,
            level: "Intermediate",
            categoryId: (await prisma.category.findFirst())?.id || "dummy-cat",
            imageUrl: "/uploads/bulk1.jpg",
        }
    });

    const course2 = await prisma.course.create({
        data: {
            title: `Bulk Course 2 ${Date.now()}`,
            description: "Course 2 Desc",
            price: 75000,
            level: "Advanced",
            categoryId: (await prisma.category.findFirst())?.id || "dummy-cat",
            imageUrl: "/uploads/bulk2.jpg",
        }
    });

    console.log(`Created courses: ${course1.title} (${course1.id}), ${course2.title} (${course2.id})`);

    // 3. Mock files
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, "bulk1.jpg"), "bulk content 1");
    fs.writeFileSync(path.join(uploadsDir, "bulk2.jpg"), "bulk content 2");

    try {
        // 4. Bulk Export
        console.log("Exporting courses (bulk)...");
        const zipPath = await exportCoursesToZip([course1.id, course2.id]);
        console.log(`Exported to: ${zipPath}`);

        // 5. Bulk Import
        console.log("Importing courses (bulk)...");
        const zipBuffer = fs.readFileSync(zipPath);
        const newCourseIds = await importCoursesFromZip(zipBuffer, user.id);
        console.log(`Imported ${newCourseIds.length} courses: ${newCourseIds.join(", ")}`);

        // 6. Verify
        if (newCourseIds.length !== 2) {
            console.error("FAILED: Expected 2 imported courses");
        } else {
            const imported1 = await prisma.course.findUnique({ where: { id: newCourseIds[0] } });
            const imported2 = await prisma.course.findUnique({ where: { id: newCourseIds[1] } });

            console.log(`Imported 1: ${imported1?.title}`);
            console.log(`Imported 2: ${imported2?.title}`);

            if (imported1?.title.includes("(Imported)") && imported2?.title.includes("(Imported)")) {
                console.log("PASSED: Bulk import successful with renamed titles");
            } else {
                console.warn("WARNING: Titles might not have been renamed correctly");
            }
        }

        // Cleanup
        fs.unlinkSync(zipPath);

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
