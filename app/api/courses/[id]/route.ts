import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    include: {
                        lessons: {
                            orderBy: { order: "asc" }
                        }
                    },
                    orderBy: { order: "asc" }
                },
                category: true,
                _count: {
                    select: {
                        enrollments: true,
                        reviews: true
                    }
                }
            }
        });

        if (!course) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(course);
    } catch (error) {
        console.error("[COURSE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const values = await req.json();

        // Destructure known fields to prevent "Unknown argument" errors
        const {
            title, description, shortDescription, fullDescription, slug,
            categoryId, price, level, language, imageUrl,
            isPublished, visibility, enrollmentType, certificateEnabled, completionRule,
            whatYouLearn, modules
        } = values;

        // Transaction to ensure integrity
        const course = await prisma.$transaction(async (tx) => {
            // 1. Update Course Details
            const updatedCourse = await tx.course.update({
                where: { id },
                data: {
                    title,
                    description,
                    shortDescription: shortDescription || description, // Fallback if needed or map correctly
                    fullDescription,
                    slug,
                    price,
                    level,
                    language,
                    imageUrl,
                    published: visibility === "public" || isPublished === true, // Sync published with visibility
                    visibility,
                    enrollmentType,
                    certificateEnabled,
                    completionRule,
                    whatYouLearn: whatYouLearn ? JSON.stringify(whatYouLearn) : null,
                    category: categoryId ? { connect: { id: categoryId } } : undefined
                }
            });

            // 2. Handle Modules & Lessons (Recreate strategy)

            // Delete existing relations
            await tx.lesson.deleteMany({
                where: { module: { courseId: id } }
            });

            await tx.module.deleteMany({
                where: { courseId: id }
            });

            // Recreate Modules and Lessons
            if (modules && modules.length > 0) {
                for (const module of modules) {
                    await tx.module.create({
                        data: {
                            title: module.title,
                            order: module.order,
                            courseId: id,
                            lessons: {
                                create: module.lessons.map((lesson: any) => ({
                                    title: lesson.title,
                                    contentType: lesson.contentType || lesson.type || "text",
                                    content: lesson.content || lesson.contentUrl || "",
                                    duration: lesson.duration || null,
                                    order: lesson.order
                                }))
                            }
                        }
                    });
                }
            }

            return updatedCourse;
        });

        return NextResponse.json(course);
    } catch (error) {
        console.error("[COURSE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const course = await prisma.course.delete({
            where: {
                id,
            },
        });

        return NextResponse.json(course);
    } catch (error) {
        console.error("[COURSE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
