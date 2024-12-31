import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { User } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const clerk = await currentUser();

  if (!clerk) return null;

  const user = await db.user.findUnique({
    where: {
      id: clerk.id,
    },
  });

  if (user?.role === "ADMIN") {
    return redirect("/dashboard/admin");
  }

  if (!user?.role || user?.role === "USER") {
    return redirect("/");
  }

  if (user.role === "SELLER") {
    console.log(user);

    return redirect("/dashboard/seller");
  }
}
