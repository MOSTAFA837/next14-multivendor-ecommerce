import StoreShippingDetails from "@/components/dashboard/forms/store-shipping-details";
import DataTable from "@/components/ui/data-table";
import {
  getStoreShippingDetails,
  getStoreShippingRates,
} from "@/queries/store";
import { columns } from "./columns";

async function SellerStoreShippingPage({
  params,
}: {
  params: { storeUrl: string };
}) {
  const shippingDetails = await getStoreShippingDetails(params.storeUrl);
  const shippingRates = await getStoreShippingRates(params.storeUrl);

  return (
    <div>
      <StoreShippingDetails data={shippingDetails} storeUrl={params.storeUrl} />

      <DataTable
        filterValue="countryName"
        data={shippingRates}
        columns={columns}
        searchPlaceholder="Search by country name..."
      />
    </div>
  );
}

export default SellerStoreShippingPage;
