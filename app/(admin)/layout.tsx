import { AdminLayout } from "@/components/AdminLayout";
import { RedirectToSignIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        return <RedirectToSignIn />;
    }

    // Check role in database
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id }
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
        return redirect("/");
    }

    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
