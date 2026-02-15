import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { exportCoursesToZip } from "@/lib/course-export";
import fs from "fs";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { courseIds } = body;

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return new NextResponse("No course IDs provided", { status: 400 });
        }

        try {
            const zipFilePath = await exportCoursesToZip(courseIds);

            // Read file
            const fileBuffer = fs.readFileSync(zipFilePath);

            // Clean up zip file after reading
            fs.unlinkSync(zipFilePath);

            // Return file
            return new NextResponse(fileBuffer, {
                headers: {
                    "Content-Disposition": `attachment; filename="courses_bulk_export_${Date.now()}.zip"`,
                    "Content-Type": "application/zip",
                },
            });
        } catch (error) {
            console.error("[BULK_EXPORT_ERROR]", error);
            return new NextResponse("Export failed", { status: 500 });
        }

    } catch (error) {
        console.error("[BULK_EXPORT_API_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
