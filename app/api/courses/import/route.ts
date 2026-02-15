import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { importCourseFromZip } from "@/lib/course-import";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new NextResponse("No file provided", { status: 400 });
        }

        if (!file.name.endsWith(".zip")) {
            return new NextResponse("Invalid file type. Please upload a ZIP file.", { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        try {
            const courseId = await importCourseFromZip(buffer, userId);

            return NextResponse.json({
                success: true,
                courseId,
                message: "Course imported successfully"
            });
        } catch (error) {
            console.error("[COURSE_IMPORT_ERROR]", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to import course";
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }

    } catch (error) {
        console.error("[COURSE_IMPORT_API_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
