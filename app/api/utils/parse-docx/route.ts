import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;
        const messages = result.messages; // Any warnings

        if (messages.length > 0) {
            console.warn("Mammoth warnings:", messages);
        }

        return NextResponse.json({ text });
    } catch (error) {
        console.error("Error parsing docx:", error);
        return NextResponse.json({ error: "Failed to parse document" }, { status: 500 });
    }
}
