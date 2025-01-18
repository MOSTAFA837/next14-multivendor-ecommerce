import StoreDetails from "@/components/dashboard/forms/store-details";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SellerStoreSettingsPage({
  params,
}: {
  params: { storeUrl: string };
}) {
  const store = await db.store.findUnique({
    where: {
      url: params.storeUrl,
    },
  });

  if (!store) redirect("/dashboard/seller/stores");

  return (
    <div>
      <StoreDetails data={store} />
    </div>
  );
}
