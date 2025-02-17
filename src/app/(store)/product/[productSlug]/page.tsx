import StoreCard from "@/components/store/cards/store-card";
import Descriptions from "@/components/store/product-page/descriptions";
import ProductPageContainer from "@/components/store/product-page/product-info/container";
import Questions from "@/components/store/product-page/questions";
import RelatedProducts from "@/components/store/product-page/related-products";
import Specifications from "@/components/store/product-page/specifications";
import { Separator } from "@/components/ui/separator";
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

  const store = {
    id: product.store.id,
    name: product.store.name,
    url: product.store.url,
    logo: product.store.logo,
    followersCount: 0,
    isUserFollowingStore: false,
  };

  return (
    <div className="max-w-[1650px] mx-auto p-4 overflow-x-hidden">
      <ProductPageContainer
        productData={product}
        variantSlug={searchParams.variant}
        userCountry={userCountry}
      >
        <>
          <Separator />

          {/* related products */}
          <RelatedProducts
            productId={product.id}
            categoryId={product.categoryId}
            subCategoryId={product.subCategoryId}
          />
        </>

        <>
          <Separator className="mt-6" />
          {/* Product description */}
          <Descriptions
            text={[product.description, variant?.variantDescription || ""]}
          />
        </>

        <Separator className="mt-6" />

        {(specs.product || specs.variant) && <Specifications specs={specs} />}

        <Separator className="mt-6" />

        {product.questions && <Questions questions={product.questions} />}

        <Separator className="mt-6" />
        <div className="h-6" />

        <StoreCard store={store} />
      </ProductPageContainer>
    </div>
  );
}
