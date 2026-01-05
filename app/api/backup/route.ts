import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        // TODO: Strict Admin Check here using metadata or DB role
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");

        let data: any[] = [];
        let fields: string[] = [];

        if (type === "courses") {
            const courses = await prisma.course.findMany();
            if (courses.length > 0) {
                fields = Object.keys(courses[0]);
                // Flatten or handle generic object - simplified for CSV
                data = courses.map(c => {
                    const row: any = { ...c };
                    // Handle Date objects
                    row.createdAt = row.createdAt.toISOString();
                    row.updatedAt = row.updatedAt.toISOString();
                    // Handle Decimals
                    row.price = row.price.toString();
                    return row;
                });
            }
        } else if (type === "quizzes") {
            const quizzes = await prisma.quiz.findMany({
                include: { questions: true }
            });
            if (quizzes.length > 0) {
                // Determine fields from the first item, but manually ensure questionsJson is included
                // We construct the data array explicitly to include questionsJson
                fields = [...Object.keys(quizzes[0]).filter(k => k !== 'questions'), 'questionsJson'];

                data = quizzes.map(q => {
                    const { questions, ...rest } = q;
                    return {
                        ...rest,
                        createdAt: q.createdAt.toISOString(),
                        updatedAt: q.updatedAt.toISOString(),
                        questionsJson: JSON.stringify(questions)
                    };
                });
            }
        } else if (type === "users") {
            const users = await prisma.user.findMany();
            if (users.length > 0) {
                fields = Object.keys(users[0]);
                data = users.map(u => ({
                    ...u,
                    createdAt: u.createdAt.toISOString(),
                    updatedAt: u.updatedAt.toISOString(),
                }));
            }
        } else {
            return new NextResponse("Invalid type", { status: 400 });
        }

        if (data.length === 0) {
            return new NextResponse("No data found to export", { status: 404 });
        }

        // Convert to CSV
        const header = fields.join(",");
        const rows = data.map(row =>
            fields.map(field => {
                const val = row[field];
                if (val === null || val === undefined) return "";
                // Escape quotes
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            }).join(",")
        );
        const csv = [header, ...rows].join("\n");

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${type}.csv"`,
            },
        });
    } catch (error) {
        console.error("[BACKUP_EXPORT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

const isEqual = (val1: any, val2: any) => {
    // Simple comparison for strings/numbers/booleans
    if (val1 === val2) return true;
    // Handle stringified booleans from CSV
    if (typeof val1 === 'boolean' && val2 === String(val1)) return true;
    if (typeof val2 === 'boolean' && val1 === String(val2)) return true;
    // Handle null/undefined vs empty string
    if ((val1 === null || val1 === undefined) && val2 === "") return true;
    if ((val2 === null || val2 === undefined) && val1 === "") return true;
    // Handle numbers
    if (typeof val1 === 'number' && Number(val2) === val1) return true;

    return String(val1) === String(val2);
};

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        // TODO: Strict Admin Check
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string;
        const isPreview = formData.get("preview") === "true";

        if (!file || !type) return new NextResponse("Missing file or type", { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const content = buffer.toString();

        // Parse CSV
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as any[];

        if (isPreview) {
            const ids = records.map(r => r.id).filter(Boolean);
            let existingMap = new Map();
            let summary = {
                new: 0,
                updated: 0,
                unchanged: 0,
                total: records.length,
                details: [] as any[] // Optional: send back details for a table view
            };

            if (type === "courses") {
                const existing = await prisma.course.findMany({
                    where: { id: { in: ids } }
                });
                existing.forEach(e => existingMap.set(e.id, e));

                summary.details = records.map(row => {
                    if (!row.id || row.id.trim() === "") {
                        summary.new++;
                        return { id: "(New - Auto)", title: row.title || "Untitled", status: 'new' };
                    }

                    const exists = existingMap.get(row.id);
                    if (!exists) {
                        summary.new++;
                        return { id: row.id, title: row.title, status: 'new' };
                    }

                    // Compare fields (excluding timestamps)
                    const hasChanges =
                        !isEqual(exists.title, row.title) ||
                        !isEqual(exists.price, row.price) ||
                        !isEqual(exists.published, row.published) ||
                        !isEqual(exists.level, row.level); // Add more fields as critical

                    if (hasChanges) {
                        summary.updated++;
                        return { id: row.id, title: row.title, status: 'updated' };
                    } else {
                        summary.unchanged++;
                        return { id: row.id, title: row.title, status: 'unchanged' };
                    }
                });
            } else if (type === "quizzes") {
                const existing = await prisma.quiz.findMany({
                    where: { id: { in: ids } }
                });
                existing.forEach(e => existingMap.set(e.id, e));

                summary.details = records.map(row => {
                    if (!row.id || row.id.trim() === "") {
                        summary.new++;
                        return { id: "(New - Auto)", title: row.title || "Untitled", status: 'new' };
                    }

                    const exists = existingMap.get(row.id);
                    if (!exists) {
                        summary.new++;
                        return { id: row.id, title: row.title, status: 'new' };
                    }

                    const hasChanges =
                        !isEqual(exists.title, row.title) ||
                        !isEqual(exists.passingScore, row.passingScore) ||
                        !isEqual(exists.status, row.status);

                    if (hasChanges) {
                        summary.updated++;
                        return { id: row.id, title: row.title, status: 'updated' };
                    } else {
                        summary.unchanged++;
                        return { id: row.id, title: row.title, status: 'unchanged' };
                    }
                });
            } else if (type === "users") {
                const existing = await prisma.user.findMany({
                    where: { id: { in: ids } }
                });
                existing.forEach(e => existingMap.set(e.id, e));

                summary.details = records.map(row => {
                    if (!row.id || row.id.trim() === "") {
                        summary.new++;
                        return { id: "(New - Auto)", email: row.email || "Unknown", status: 'new' };
                    }

                    const exists = existingMap.get(row.id);
                    if (!exists) {
                        summary.new++;
                        return { id: row.id, email: row.email, status: 'new' };
                    }

                    const hasChanges =
                        !isEqual(exists.email, row.email) ||
                        !isEqual(exists.role, row.role);

                    if (hasChanges) {
                        summary.updated++;
                        return { id: row.id, email: row.email, status: 'updated' };
                    } else {
                        summary.unchanged++;
                        return { id: row.id, email: row.email, status: 'unchanged' };
                    }
                });
            }

            return NextResponse.json(summary);
        }

        // --- ACTUAL IMPORT EXECUTION ---

        let count = 0;

        if (type === "courses") {
            // Need a valid category ID for fallback
            const defaultCategory = await prisma.category.findFirst();
            const fallbackCategoryId = defaultCategory?.id || "";

            // Pre-fetch existing slugs to handle collisions efficiently
            const existingCourses = await prisma.course.findMany({
                select: { id: true, slug: true }
            });

            // Map of Slug -> Array of IDs that use it (though unique constraint means usually 1)
            // But we actually need to know "Is this slug taken by a DIFFERENT ID?"
            const slugMap = new Map<string, string>();
            existingCourses.forEach(c => {
                if (c.slug) slugMap.set(c.slug, c.id);
            });

            // Set of slugs used in THIS batch to prevent intra-batch collisions
            const limitLoop = 100;

            for (const row of records) {
                const { id, title, description, price, level, imageUrl, published, categoryId, certificateEnabled, completionRule, enrollmentType, fullDescription, language, prerequisites, shortDescription, slug, targetAudience, visibility, whatYouLearn } = row;

                // Sanitize whatYouLearn
                let sanitizedWhatYouLearn = whatYouLearn || null;
                if (sanitizedWhatYouLearn) {
                    try {
                        JSON.parse(sanitizedWhatYouLearn);
                    } catch (e) {
                        sanitizedWhatYouLearn = JSON.stringify([sanitizedWhatYouLearn]);
                    }
                }

                // Determine base slug
                let baseSlug = slug;
                if (!baseSlug || baseSlug.trim() === "") {
                    baseSlug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `course-${Date.now()}`;
                }

                // Ensure uniqueness
                let finalSlug = baseSlug;
                let counter = 1;

                // Loop while slug is taken by someone else OR taken in this batch
                while (true) {
                    const takenById = slugMap.get(finalSlug);
                    const isTaken = takenById !== undefined;

                    // If not taken, we are good
                    if (!isTaken) break;

                    // If taken, is it by ME? (Update scenario)
                    // If I have an ID, and the taken ID matches mine, it's fine.
                    if (id && takenById === id) break;

                    // Collision! Generate new slug
                    finalSlug = `${baseSlug}-${counter}`;
                    counter++;
                    if (counter > limitLoop) {
                        finalSlug = `${baseSlug}-${Date.now()}`; // Last resort
                        break;
                    }
                }

                // Register this slug as taken for subsequent iterations
                // Even if we don't have an ID yet (create scenario), we must reserve the slug
                // Use a temporary placeholder ID if the record has no ID
                const recordId = id || `temp-${finalSlug}`;
                slugMap.set(finalSlug, recordId);

                const dataPayload = {
                    title: title || `Untitled Course ${new Date().toISOString()}`,
                    description: description || "Imported content",
                    price: price ? Number(price) : 0,
                    level: level || "Beginner",
                    imageUrl: imageUrl || null,
                    published: published === 'true',
                    categoryId: categoryId || fallbackCategoryId,
                    certificateEnabled: certificateEnabled === 'true',
                    completionRule: completionRule || "manual",
                    enrollmentType: enrollmentType || "open",
                    fullDescription: fullDescription || null,
                    language: language || "id",
                    prerequisites: prerequisites || null,
                    shortDescription: shortDescription || null,
                    slug: finalSlug,
                    targetAudience: targetAudience || null,
                    visibility: visibility || "draft",
                    whatYouLearn: sanitizedWhatYouLearn
                };

                if (id && id.trim() !== "") {
                    await prisma.course.upsert({
                        where: { id },
                        update: dataPayload,
                        create: { id, ...dataPayload }
                    });
                } else {
                    await prisma.course.create({
                        data: dataPayload
                    });
                }
                count++;
            }
        } else if (type === "quizzes") {
            for (const row of records) {
                const { id, title, description, type, timeLimit, attemptLimit, passingScore, randomize, status, questionsJson } = row;

                const dataPayload = {
                    title: title || `Untitled Quiz ${new Date().toISOString()}`,
                    description: description || null,
                    type: type || "practice",
                    timeLimit: timeLimit ? Number(timeLimit) : null,
                    attemptLimit: attemptLimit ? Number(attemptLimit) : null,
                    passingScore: passingScore ? Number(passingScore) : 70,
                    randomize: randomize === 'true',
                    status: status || "draft"
                };

                let quizResult;
                if (id && id.trim() !== "") {
                    quizResult = await prisma.quiz.upsert({
                        where: { id },
                        update: dataPayload,
                        create: { id, ...dataPayload }
                    });
                } else {
                    quizResult = await prisma.quiz.create({
                        data: dataPayload
                    });
                }

                // Restore Questions
                if (questionsJson) {
                    try {
                        const questions = JSON.parse(questionsJson);
                        if (Array.isArray(questions)) {
                            for (const q of questions) {
                                // Ensure options is handled correctly (it might come as a string or object depending on JSON stringify depth)
                                // In the export, it was from Prisma which returns JSON object if typed as JSON?
                                // Schema says options is Json? 
                                // Actually Schema says `options String? @db.LongText` or `Json?`? 
                                // Let's check Schema: `options String? @db.LongText`.
                                // So in export (Prisma client), it is a string.
                                // In Import, it is a string.

                                const qPayload = {
                                    type: q.type,
                                    question: q.question,
                                    options: q.options, // It's already a string matching DB text
                                    correctAnswer: q.correctAnswer,
                                    explanation: q.explanation,
                                    score: q.score,
                                    order: q.order,
                                    quizId: quizResult.id
                                };

                                await prisma.question.upsert({
                                    where: { id: q.id },
                                    update: qPayload,
                                    create: { id: q.id, ...qPayload }
                                });
                            }
                        }
                    } catch (e) {
                        console.error(`Failed to parse questions for quiz ${title}:`, e);
                    }
                }

                count++;
            }
        } else if (type === "users") {
            for (const row of records) {
                const { id, clerkId, email, role } = row;

                // Users require clerkId and email unique. If missing, we skip or generate placeholder if user wants forced creation.
                // Assuming minimal validation for restore.
                if (!clerkId || !email) continue;

                const dataPayload = {
                    clerkId,
                    email,
                    role: role || "USER"
                };

                if (id && id.trim() !== "") {
                    await prisma.user.upsert({
                        where: { id },
                        update: dataPayload,
                        create: { id, ...dataPayload }
                    });
                } else {
                    // For users, we can try to find by clerkId if ID is missing?
                    // Or just create.
                    await prisma.user.create({
                        data: dataPayload
                    });
                }
                count++;
            }
        }

        return NextResponse.json({ count });
    } catch (error) {
        console.error("[BACKUP_IMPORT]", error);
        return new NextResponse("Internal Error: " + (error as Error).message, { status: 500 });
    }
}
