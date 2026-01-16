
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const user = await currentUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Add admin check here if needed

        if (!prisma.siteSettings) {
            return NextResponse.json(
                { error: "Prisma Client is stale. Please restart the server to load the new schema." },
                { status: 503 }
            );
        }

        const settings = await prisma.siteSettings.findUnique({
            where: { key: "landing_page" },
        });

        if (!settings) {
            // Return default empty structure or null if not seeded yet
            return NextResponse.json({});
        }

        return NextResponse.json(settings.value);
    } catch (error) {
        console.error("[SITE_SETTINGS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Add admin check here if needed

        if (!prisma.siteSettings) {
            return NextResponse.json(
                { error: "Prisma Client is stale. Please restart the server to load the new schema." },
                { status: 503 }
            );
        }

        const body = await req.json();

        const settings = await prisma.siteSettings.upsert({
            where: { key: "landing_page" },
            update: { value: body },
            create: {
                key: "landing_page",
                value: body,
            },
        });

        return NextResponse.json(settings.value);
    } catch (error) {
        console.error("[SITE_SETTINGS_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
