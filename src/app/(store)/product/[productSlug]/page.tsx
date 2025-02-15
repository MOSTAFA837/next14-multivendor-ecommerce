import ProductPageContainer from "@/components/store/product-page/product-info/container";
import { Country } from "@/lib/types";
import { retrieveProductDetailsOptimized } from "@/queries/product";
import { cookies } from "next/headers";

interface ProductVariantPageProps {
  params: {
    productSlug: string;
  };
  searchParams: {
    variant: string;
  };
}

export default async function ProductVariantPage({
  params,
  searchParams,
}: ProductVariantPageProps) {
  const product = await retrieveProductDetailsOptimized(params.productSlug);
  const variant = product.variants.find((v) => v.slug === searchParams.variant);

  const specs = {
    product: product.specs,
    variant: variant?.specs,
  };

  const cookieStore = cookies();
  const userCountryCookie = cookieStore.get("userCountry");

  // Set default country if cookie is missing
  let userCountry: Country = {
    name: "Egypt",
    city: "",
    code: "EG",
    region: "",
  };

  // If cookie exists, update the user country
  if (userCountryCookie) {
    userCountry = JSON.parse(userCountryCookie.value) as Country;
  }

  return (
    <div className="max-w-[1650px] mx-auto p-4 overflow-x-hidden">
      <ProductPageContainer
        productData={product}
        variantSlug={searchParams.variant}
        userCountry={userCountry}
      >
        <div></div>
      </ProductPageContainer>
    </div>
  );
}
