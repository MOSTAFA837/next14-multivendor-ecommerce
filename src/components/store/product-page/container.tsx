"use client";

import { ProductPageDataType } from "@/lib/types";
import { ReactNode } from "react";
import ProductSwiper from "./swiper";
import ProductInfo from "./info";

interface ProductPageContainerProps {
  productData: ProductPageDataType;
  sizeId?: string;
  variantSlug: string;
  children: ReactNode;
}

export default function ProductPageContainer({
  children,
  productData,
  sizeId,
  variantSlug,
}: ProductPageContainerProps) {
  if (!productData) return null;
  const { images, variants } = productData;

  return (
    <div className="relative">
      <div className="w-full xl:flex xl:gap-4">
        <div className="w-full flex-1">
          <ProductSwiper images={images} />
        </div>

        <div className="w-full mt-4 md:mt-0 flex flex-col gap-4 lg:flex-row">
          <ProductInfo productData={productData} sizeId={sizeId} />
        </div>
      </div>
    </div>
  );
}
