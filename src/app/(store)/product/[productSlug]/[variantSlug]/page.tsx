import ProductPageContainer from "@/components/store/product-page/container";
import { getProductPageData } from "@/queries/product";
import { notFound, redirect } from "next/navigation";

interface ProductVariantPageProps {
  params: {
    productSlug: string;
    variantSlug: string;
  };
  searchParams: {
    size?: string;
  };
}

export default async function ProductVariantPage({
  params: { productSlug, variantSlug },
  searchParams: { size: sizeId },
}: ProductVariantPageProps) {
  const product = await getProductPageData(productSlug, variantSlug);

  if (!product) return notFound();

  const { sizes } = product;

  // if (sizeId) {
  //   const isValidSize = sizes.some((size) => size.id === sizeId);

  //   if (!isValidSize) {
  //     return redirect(`/product/${productSlug}/${variantSlug}`);
  //   }
  // } else if (sizes.length === 1) {
  //   return redirect(`/product/${productSlug}/?size=${sizes[0].id}`);
  // }

  return (
    <div className="max-w-[1650px] mx-auto p-4 overflow-x-hidden">
      <ProductPageContainer
        productData={product}
        sizeId={sizeId}
        variantSlug={variantSlug}
      >
        <div></div>
      </ProductPageContainer>
    </div>
  );
}
