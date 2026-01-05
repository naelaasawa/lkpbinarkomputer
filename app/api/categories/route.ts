import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                name: "asc",
            },
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, icon, color } = await req.json();

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                name,
                icon: icon || "Layout",
                color: color || "#000000",
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("[CATEGORIES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
