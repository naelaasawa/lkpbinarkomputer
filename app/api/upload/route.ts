import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync, readFileSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Determine file type
        const mimeType = file.type;
        let fileType = "file";
        if (mimeType.startsWith("image/")) fileType = "image";
        else if (mimeType.startsWith("video/")) fileType = "video";
        else if (mimeType === "application/pdf") fileType = "pdf";

        // Generate relative path for DB/Client
        let uploadSubPath = "uploads";

        // Check for courseId to categorize uploads
        const courseId = formData.get("courseId") as string;
        if (courseId) {
            uploadSubPath = path.join("uploads", "materials", "courses", courseId);
        }

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), "public", uploadSubPath);
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const filename = `${timestamp}_${sanitizedName}`;
        const filepath = path.join(uploadDir, filename);



        // Save file to local storage
        await writeFile(filepath, buffer);

        // For PDF files, try simple text extraction for structure
        let metadata: any = null;
        if (fileType === "pdf") {
            // Simple fallback structure without pdf-parse
            metadata = {
                title: file.name.replace(".pdf", "").replace(/_/g, " "),
                totalPages: 0,
                modules: [{
                    title: file.name.replace(".pdf", "").replace(/_/g, " "),
                    lessons: [{ title: "Materi Lengkap" }],
                }],
            };
        }

        const fileUrl = `/${uploadSubPath}/${filename}`;

        // Return the file info
        return NextResponse.json({
            success: true,
            url: fileUrl,
            file: {
                url: fileUrl,
                filename,
                originalName: file.name,
                type: fileType,
                size: buffer.length,
                metadata,
            },
        });
    } catch (error) {
        console.error("[UPLOAD_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}

// Get uploaded files from local directory
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads");

        if (!existsSync(uploadDir)) {
            return NextResponse.json([]);
        }

        // List files in directory
        const fs = await import("fs/promises");
        const files = await fs.readdir(uploadDir);

        const fileList = files
            .filter(f => !f.startsWith("."))
            .map(filename => ({
                filename,
                url: `/uploads/${filename}`,
            }));

        return NextResponse.json(fileList);
    } catch (error) {
        console.error("[FILES_GET_ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
    }
}
