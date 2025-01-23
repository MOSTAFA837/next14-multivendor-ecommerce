"use server";

import { currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";

export const checkUserRole = async (role: Role) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated");

  if (user.privateMetadata.role !== role) {
    throw new Error(
      `Unauthorized Access: ${role} Privileges Required for Entry.`
    );
  }

  return user;
};
