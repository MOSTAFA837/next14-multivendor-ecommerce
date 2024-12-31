import { ReactNode } from "react";

import { privateRoute } from "@/lib/utils";

import Sidebar from "@/components/dashboard/sidebar/sidebar";
import Header from "@/components/dashboard/header/header";

async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  // Block non admins from accessing the admin dashboard
  await privateRoute("ADMIN");

  return (
    <div className="w-full h-full">
      <Sidebar isAdmin />

      <div className="ml-[300px]">
        <Header />

        <div className="w-full mt-[75px] p-4">{children}</div>
      </div>
    </div>
  );
}

export default AdminDashboardLayout;
