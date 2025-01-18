import { FC } from "react";
import { currentUser } from "@clerk/nextjs/server";

import Logo from "@/components/shared/logo";
import {
  adminDashboardSidebarOptions,
  SellerDashboardSidebarOptions,
} from "@/constants/data";

import UserInfo from "./user-info";
import SidebarNavAdmin from "./nav-admin";
import { Store } from "@prisma/client";
import SidebarNavSeller from "./nav-seller";
import StoreSwitcher from "./store-switcher";

interface SidebarProps {
  isAdmin?: boolean;
  stores?: Store[];
}

const Sidebar: FC<SidebarProps> = async ({ isAdmin, stores }) => {
  const user = await currentUser();

  return (
    <div className="w-[300px] border-r pt-9 p-4 justify-between h-full flex flex-col fixed top-0 left-0 bottom-0">
      <Logo width="100%" height="140px" />
      <span className="mt-3" />

      {user && <UserInfo user={user} />}

      {!isAdmin && stores && <StoreSwitcher stores={stores} />}

      {isAdmin ? (
        <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} />
      ) : (
        <SidebarNavSeller menuLinks={SellerDashboardSidebarOptions} />
      )}
    </div>
  );
};
export default Sidebar;
