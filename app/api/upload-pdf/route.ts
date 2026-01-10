import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Custom render function to disable canvas requirement
function renderPage() {
    return Promise.resolve("");
}

// Parse PDF text to extract structure
function parseTextToStructure(text: string, filename: string) {
    const lines = text.split('\n').filter(line => line.trim());

    const structure = {
        title: "",
        modules: [] as { title: string; lessons: { title: string; type: string }[] }[]
    };

    // Find title from first line
    if (lines.length > 0) {
        structure.title = lines[0].trim().substring(0, 100);
    }

    let currentModule: { title: string; lessons: { title: string; type: string }[] } | null = null;

    // Patterns for Indonesian documents
    const partPattern = /^(🔓|📚|📖)?\s*PART\s*(\d+)\s*[—–-]\s*(.+)/i;
    const babPattern = /^BAB\s*(\d+)\s*[.:\s]+(.+)/i;
    const modulPattern = /^MODUL\s*(\d+)\s*[.:\s]+(.+)/i;
    const praktikPattern = /^PRAKTIK\s*[—–-]?\s*(.+)/i;
    const numberedPattern = /^(\d+)\.\s*(.+)/;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length < 3) continue;

        // Check for PART pattern
        let partMatch = trimmed.match(partPattern);
        if (!partMatch) partMatch = trimmed.match(babPattern);
        if (!partMatch) partMatch = trimmed.match(modulPattern);
        if (!partMatch) partMatch = trimmed.match(praktikPattern);

        if (partMatch) {
            // Save previous module
            if (currentModule && currentModule.lessons.length > 0) {
                structure.modules.push(currentModule);
            }

            // Clean up the title
            let moduleTitle = trimmed;
            if (partMatch[3]) {
                moduleTitle = `PART ${partMatch[2]} - ${partMatch[3].trim()}`;
            } else if (partMatch[2]) {
                moduleTitle = partMatch[2].trim();
            } else if (partMatch[1]) {
                moduleTitle = partMatch[1].trim();
            }

            // Remove "Akses:" suffix if present
            moduleTitle = moduleTitle.replace(/\s*Akses:.+$/i, "").trim();

            currentModule = {
                title: moduleTitle.substring(0, 100),
                lessons: []
            };
            continue;
        }

        // Check for numbered lessons (1. Title, 2. Title, etc.)
        const numMatch = trimmed.match(numberedPattern);
        if (numMatch && currentModule) {
            const lessonTitle = numMatch[2].trim();
            // Only add if it looks like a lesson title (not too long, not just content)
            if (lessonTitle.length > 3 && lessonTitle.length < 100 && !lessonTitle.includes(':')) {
                currentModule.lessons.push({
                    title: `${numMatch[1]}. ${lessonTitle}`,
                    type: "text"
                });
            }
        }
    }

    // Push last module
    if (currentModule) {
        structure.modules.push(currentModule);
    }

    // If no modules found, create default
    if (structure.modules.length === 0) {
        structure.title = filename.replace(".pdf", "").replace(/_/g, " ");
        structure.modules.push({
            title: structure.title,
            lessons: [{ title: "Materi Lengkap", type: "text" }]
        });
    }

    return structure;
}

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

        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), "public", "files");
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const filename = `${timestamp}_${sanitizedName}`;
        const filepath = path.join(uploadDir, filename);

        // Save file
        await writeFile(filepath, buffer);

        let structure;
        let totalPages = 0;

        try {
            // Try to parse PDF with custom options to avoid canvas
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdf = require("pdf-parse/lib/pdf-parse.js");

            const options = {
                // Disable canvas rendering
                pagerender: renderPage,
                max: 0, // No limit on pages
            };

            const data = await pdf(buffer, options);
            totalPages = data.numpages || 0;

            // Parse extracted text to get structure
            structure = parseTextToStructure(data.text, file.name);

            console.log("[PDF_PARSED] Pages:", totalPages, "Modules:", structure.modules.length);
        } catch (parseError) {
            console.error("[PDF_PARSE_ERROR]", parseError);
            // Fallback to filename-based structure
            structure = {
                title: file.name.replace(".pdf", "").replace(/_/g, " "),
                modules: [{
                    title: file.name.replace(".pdf", "").replace(/_/g, " "),
                    lessons: [
                        { title: "Pendahuluan", type: "text" },
                        { title: "Materi Utama", type: "text" },
                        { title: "Rangkuman", type: "text" }
                    ]
                }]
            };
        }

        return NextResponse.json({
            success: true,
            filename,
            filepath: `/files/${filename}`,
            totalPages,
            structure
        });
    } catch (error) {
        console.error("[PDF_UPLOAD_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to upload PDF" },
            { status: 500 }
        );
    }
}
