import { ReactNode } from "react";
import { redirect } from "next/navigation";

import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";

import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export default async function SellerStoreDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  // Retrieve the list of stores associated with the authenticated user.
  const stores = await db.store.findMany({
    where: {
      userId: user.id,
    },
  });

  return (
    <div className="h-full w-full flex">
      <Sidebar stores={stores} />

      <div className="w-full ml-[300px]">
        <Header />

        <div className="w-full mt-[75px] p-4">{children}</div>
      </div>
    </div>
  );
}
