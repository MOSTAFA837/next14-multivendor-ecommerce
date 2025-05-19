import DataTable from "@/components/ui/data-table";
import { getStoreCoupons } from "@/queries/coupon";
import { Plus } from "lucide-react";
import React from "react";
import { columns } from "./columns";
import CouponDetails from "@/components/dashboard/forms/coupon-details";

export default async function SellerCouponsPage({
  params,
}: {
  params: { storeUrl: string };
}) {
  // Get all store coupons
  const coupons = await getStoreCoupons(params.storeUrl);

  return (
    <div>
      <DataTable
        actionButtonText={
          <>
            <Plus size={15} />
            Create coupon
          </>
        }
        newTabLink={`/dashboard/seller/stores/${params.storeUrl}/coupons/new`}
        filterValue="name"
        data={coupons}
        searchPlaceholder="Search by name..."
        modalChildren={<CouponDetails storeUrl={params.storeUrl} />}
        columns={columns}
      />
    </div>
  );
}
