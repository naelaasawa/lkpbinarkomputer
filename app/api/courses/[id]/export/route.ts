import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { exportCourseToZip } from "@/lib/course-export";
import fs from "fs";
import { prisma as db } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const { id: courseId } = await params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const course = await db.course.findUnique({
            where: {
                id: courseId,
            },
        });

        if (!course) {
            return new NextResponse("Course not found", { status: 404 });
        }

        try {
            const zipFilePath = await exportCourseToZip(courseId);

            // Read file
            const fileBuffer = fs.readFileSync(zipFilePath);

            // Clean up zip file after reading
            fs.unlinkSync(zipFilePath);

            // Return file
            return new NextResponse(fileBuffer, {
                headers: {
                    "Content-Disposition": `attachment; filename="course_${course.title.replace(/[^a-z0-9]/gi, '_')}.zip"`,
                    "Content-Type": "application/zip",
                },
            });
        } catch (error) {
            console.error("[COURSE_EXPORT_ERROR]", error);
            return new NextResponse("Export failed", { status: 500 });
        }

    } catch (error) {
        console.error("[COURSE_EXPORT_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
