import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { courses: true }
                }
            }
        });

        if (!category) {
            return new NextResponse("Category not found", { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("[CATEGORY_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { name, icon, color } = await req.json();

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                ...(icon && { icon }),
                ...(color && { color }),
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("[CATEGORY_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Check if category has courses
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { courses: true }
                }
            }
        });

        if (!category) {
            return new NextResponse("Category not found", { status: 404 });
        }

        if (category._count.courses > 0) {
            return new NextResponse(
                `Cannot delete category with ${category._count.courses} courses. Please reassign courses first.`,
                { status: 400 }
            );
        }

        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("[CATEGORY_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
