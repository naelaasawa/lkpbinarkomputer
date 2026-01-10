import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Polyfill DOMMatrix for pdf-parse if not available
if (typeof global.DOMMatrix === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor() { }
    };
}
if (typeof global.Path2D === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Path2D = class Path2D { constructor() { } };
}
if (typeof global.ImageData === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).ImageData = class ImageData { constructor() { } };
}

// Custom render function to disable canvas requirement
function renderPage() {
    return Promise.resolve("");
}

// Parse PDF text to extract structure AND content
function parseTextToStructure(text: string, filename: string) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const structure = {
        title: "",
        modules: [] as { title: string; lessons: { title: string; type: string; content?: string }[] }[]
    };

    // Find title from first few lines (heuristic)
    if (lines.length > 0) {
        structure.title = lines[0].substring(0, 100);
    }

    let currentModule: { title: string; lessons: { title: string; type: string; content?: string }[] } | null = null;
    let currentLesson: { title: string; type: string; content?: string } | null = null;
    let currentContentBuffer: string[] = [];

    // Helper to flush current lesson content
    const flushLessonContent = () => {
        if (currentLesson && currentContentBuffer.length > 0) {
            // Join lines with breaks, try to preserve paragraphs
            const content = currentContentBuffer
                .map(line => {
                    // Detect lists
                    if (line.match(/^[•\-\*]\s+/)) return `<li>${line.replace(/^[•\-\*]\s+/, "")}</li>`;
                    // Detect numbered lists in content (e.g. 1. item)
                    if (line.match(/^\d+\.\s+/)) return `<p class="mb-2 font-medium">${line}</p>`;
                    return `<p class="mb-2">${line}</p>`;
                })
                .join("");

            currentLesson.content = content.replace(/<\/li><li>/g, "</li><li>"); // optimized list joining could be done but simple logic for now
            currentContentBuffer = [];
        }
    };

    // Save module helper
    const flushModule = () => {
        flushLessonContent();
        if (currentModule) {
            structure.modules.push(currentModule);
            currentModule = null;
            currentLesson = null;
        }
    };

    // Patterns based on user sample
    // PART 1 — PENGENALAN Microsoft Word Akses: UMUM
    const partPattern = /^(?:🔓|📖|📚|🔒)?\s*(PART|BAB|MODUL)\s*(\d+)\s*[—–-]\s*(.+)/i;
    // PRAKTIK — HEADER, FOOTER...
    const praktikPattern = /^(PRAKTIK(?:\s+DASAR)?)\s*[—–-]\s*(.+)/i;
    // LATIHAN SOAL ...
    const latihanPattern = /^(LATIHAN SOAL)(.*)/i;

    // Lesson Pattern: 1. Pengertian...
    const lessonPattern = /^(\d+)\.\s+(.+)/;

    // Patterns to ignore
    const ignorePattern = /^(Akses:|Answer:|Halaman|Page)/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip metadata lines
        if (ignorePattern.test(line)) continue;

        // 1. Check for Module Headers
        let moduleTitle = null;

        const partMatch = line.match(partPattern);
        if (partMatch) {
            moduleTitle = `${partMatch[1]} ${partMatch[2]} - ${partMatch[3].replace(/Akses:.*$/i, "").trim()}`;
        } else {
            const praktikMatch = line.match(praktikPattern);
            if (praktikMatch) {
                moduleTitle = `${praktikMatch[1]} - ${praktikMatch[2].trim()}`;
            } else {
                const latihanMatch = line.match(latihanPattern);
                if (latihanMatch) {
                    moduleTitle = "Latihan Soal & Evaluasi";
                }
            }
        }

        if (moduleTitle) {
            flushModule();
            currentModule = {
                title: moduleTitle,
                lessons: []
            };
            continue;
        }

        // 2. Check for Lesson Headers (only if inside a module)
        // Heuristic: Must start with number, contain text, and be short enough to be a title
        const lessonMatch = line.match(lessonPattern);
        if (currentModule && lessonMatch) {
            const potentialTitle = lessonMatch[2].trim();

            // Validation to avoid false positives (like numbere list items in content)
            // If the PREVIOUS line ended with ":" or "ikut:", it's likely a list item, not a header
            // But we don't have lookbehind easily here.
            // Let's assume lesson titles are < 100 chars and don't end with "."
            if (potentialTitle.length < 150) {
                flushLessonContent();

                currentLesson = {
                    title: `${lessonMatch[1]}. ${potentialTitle}`,
                    type: "text"
                };
                currentModule.lessons.push(currentLesson);
                continue;
            }
        }

        // 3. Content Accumulation
        // If we are in a lesson, everything else is content
        if (currentLesson) {
            currentContentBuffer.push(line);
        } else if (currentModule && !currentLesson && line.length > 3) {
            // Implicit lesson if content appears before first numbered lesson
            // e.g. "Deskripsi singkat..."
            currentLesson = {
                title: "Pendahuluan / Deskripsi",
                type: "text"
            };
            currentModule.lessons.push(currentLesson);
            currentContentBuffer.push(line);
        }
    }

    // Final flush
    flushModule();

    // Fallback
    if (structure.modules.length === 0) {
        structure.title = filename.replace(".pdf", "");
        structure.modules.push({
            title: "Discovered Content",
            lessons: [{ title: "Full Content", type: "text", content: lines.join("<br/>") }]
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

        if (file.type !== "application/pdf" && file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            return NextResponse.json({ error: "Only PDF and Word (.docx) files are allowed" }, { status: 400 });
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
        const extension = path.extname(file.name);
        const sanitizedName = file.name.replace(extension, "").replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const filename = `${timestamp}_${sanitizedName}${extension}`;
        const filepath = path.join(uploadDir, filename);

        // Save file locally
        await writeFile(filepath, buffer);

        // Parse content
        let structure;
        let totalPages = 0;

        try {
            let extractedText = "";

            if (file.type === "application/pdf") {
                // PDF Parsing
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const pdf = require("pdf-parse");
                const options = {
                    pagerender: renderPage,
                    max: 0,
                };
                const data = await pdf(buffer, options);
                totalPages = data.numpages || 0;
                extractedText = data.text;
            } else {
                // DOCX Parsing with Mammoth
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const mammoth = require("mammoth");
                const result = await mammoth.extractRawText({ buffer });
                extractedText = result.value;
                // mammoth doesn't provide page count easily, default to 1 or estimate
                totalPages = 1;
            }

            structure = parseTextToStructure(extractedText, file.name);
            console.log("[DOC_PARSED] Success. Modules:", structure?.modules?.length);

        } catch (parseError) {
            console.error("[PARSE_ERROR]", parseError);
            // Fallback structure
            structure = {
                title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
                modules: [{
                    title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
                    lessons: [
                        { title: "Pendahuluan", type: "text", content: "" },
                        { title: "Materi Inti", type: "text", content: "" }
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
        console.error("[UPLOAD_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to upload document" },
            { status: 500 }
        );
    }
}
