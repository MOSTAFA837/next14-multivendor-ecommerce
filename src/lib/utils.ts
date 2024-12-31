import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { db } from "./db";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function privateRoute(role: Role) {
  const clerk = await currentUser();

  const user = await db.user.findUnique({
    where: {
      id: clerk?.id,
    },
  });

  if (user?.role !== role) {
    return redirect("/");
  }
}

export async function userRole() {
  const clerk = await currentUser();

  const user = await db.user.findUnique({
    where: {
      id: clerk?.id,
    },
  });

  return user?.role.toLocaleLowerCase();
}
