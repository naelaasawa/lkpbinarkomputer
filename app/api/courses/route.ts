import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url); // Use query params if needed
        // For now, let's just fetch all or filter if needed. The student page should likely filter.
        // But for simplicity, we return all and let client filter or we can add ?published=true support.

        // Actually, fetching full hierarchy might be heavy. Let's precise it.
        const courses = await prisma.course.findMany({
            include: {
                category: true,
                modules: {
                    include: {
                        lessons: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const serializedCourses = courses.map((course) => ({
            ...course,
            price: Number(course.price),
            // Add a computed lesson count
            totalLessons: course.modules.reduce((acc, module) => acc + module.lessons.length, 0),
        }));

        return NextResponse.json(serializedCourses);
    } catch (error) {
        console.error("[COURSES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const {
            title,
            slug,
            description,
            shortDescription,
            fullDescription,
            whatYouLearn,
            targetAudience,
            prerequisites,
            categoryId,
            level,
            language,
            visibility,
            enrollmentType,
            completionRule,
            certificateEnabled,
            modules,
            price,
        } = body;

        if (!title || !categoryId) {
            return new NextResponse("Title and category are required", { status: 400 });
        }

        // Create course with nested modules and lessons
        const course = await prisma.course.create({
            data: {
                title,
                slug,
                description: description || shortDescription || "",
                shortDescription,
                fullDescription,
                whatYouLearn: whatYouLearn ? JSON.stringify(whatYouLearn) : null,
                targetAudience,
                prerequisites,
                categoryId,
                level: level || "Beginner",
                language: language || "id",
                visibility: visibility || "draft",
                published: visibility === "public", // Map visibility to published
                enrollmentType: enrollmentType || "open",
                completionRule: completionRule || "manual",
                certificateEnabled: certificateEnabled || false,
                price: price || 0,
                modules: {
                    create: modules?.map((module: any) => ({
                        title: module.title,
                        description: module.description,
                        order: module.order,
                        lessons: {
                            create: module.lessons?.map((lesson: any) => ({
                                title: lesson.title,
                                contentType: lesson.contentType,
                                content: lesson.content,
                                duration: lesson.duration,
                                order: lesson.order,
                            })) || [],
                        },
                    })) || [],
                },
            },
            include: {
                modules: {
                    include: {
                        lessons: true,
                    },
                },
            },
        });

        return NextResponse.json(course);
    } catch (error) {
        console.error("[COURSES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
