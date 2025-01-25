"use client";

import { useState } from "react";
import Link from "next/link";
import ReactStars from "react-rating-stars-component";

import { cn } from "@/lib/utils";

import { ProductType, VariantSimplified } from "@/lib/types";
import ProductCardImageSwiper from "./swiper";
import VariantSwitcher from "./variant-switcher";

interface ProductCardProps {
  product: ProductType;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { slug, variants, name, rating, sales, variantImages } = product;

  const [variant, setVariant] = useState<VariantSimplified>(variants[0]);

  const { variantSlug, variantName, images } = variant;

  return (
    <div>
      <div
        className={cn(
          "group w-[190px] min-[480px]:w-[225px] relative transition-all duration-75 bg-white ease-in-out p-4 rounded-t-3xl border border-transparent hover:shadow-xl hover:border-border"
        )}
      >
        <div className="relative w-full h-full">
          <Link href={`/product/${slug}?variant=${variantSlug}`}>
            {/* Image Swiper */}
            <ProductCardImageSwiper images={images} />

            {/* Title */}
            <div className="text-sm text-main-primary h-[18px] overflow-hidden overflow-ellipsis line-clamp-1">
              {name} · {variantName}
            </div>

            {/* Rating - Sales */}
            <div className="flex items-center gap-x-1 h-5">
              <ReactStars
                count={5}
                size={24}
                color="#F5F5F5"
                activeColor="#FFD804"
                value={rating}
                isHalf
                edit={false}
              />

              <div className="text-xs text-main-secondary">{sales} sold</div>
            </div>
          </Link>
        </div>

        <div className="hidden group-hover:block absolute -left-[1px] bg-white border border-t-0  w-[calc(100%+2px)] px-4 pb-4 rounded-b-3xl shadow-xl z-30 space-y-2">
          {/* Variant switcher */}
          <VariantSwitcher
            images={variantImages}
            variants={variants}
            setVariant={setVariant}
            selectedVariant={variant}
          />
        </div>
      </div>
    </div>
  );
}
