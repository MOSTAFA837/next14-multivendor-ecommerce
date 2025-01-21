// Product details form
import ProductDetails from "@/components/dashboard/forms/product-details";
import { db } from "@/lib/db";

// Queries
import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";
import { getProductVariant } from "@/queries/product";

export default async function ProductVariantPage({
  params,
}: {
  params: { storeUrl: string; productId: string; variantId: string };
}) {
  const categories = await getAllCategories();
  const offerTags = await getAllOfferTags();

  const { productId, variantId, storeUrl } = params;

  const productDetails = await getProductVariant(productId, variantId);
  if (!productDetails) return;
  const newDetails = {
    ...ProductDetails,
    variantDescription: productDetails.variantDescription ?? undefined,
  };

  if (!categories) return null;

  return (
    <div>
      <ProductDetails
        categories={categories}
        storeUrl={storeUrl}
        data={newDetails}
        offerTags={offerTags}
      />
    </div>
  );
}
