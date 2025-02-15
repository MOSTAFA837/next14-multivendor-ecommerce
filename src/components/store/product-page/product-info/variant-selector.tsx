"use client";

import { ProductVariantDataType } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, FC, SetStateAction } from "react";

interface Props {
  variants: ProductVariantDataType[];
  slug: string;
  setSizeId: Dispatch<SetStateAction<string>>;
  setVariant: Dispatch<SetStateAction<ProductVariantDataType>>;
  setActiveImage: Dispatch<SetStateAction<{ url: string } | null>>;
}

export default function ProductVariantSelector({
  variants,
  slug,
  setSizeId,
  setVariant,
  setActiveImage,
}: Props) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const handleSelectVariant = (variant: ProductVariantDataType) => {
    if (variants.length === 1) return;
    setVariant(variant);
    setActiveImage(variant.images[0]);

    if (variant.sizes.length === 1) {
      setSizeId(variant.sizes[0].id);
    } else {
      setSizeId("");
    }
    params.set("variant", variant.slug);
    replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex items-center flex-wrap gap-2">
      {variants.map((variant, i) => (
        <div key={i} onClick={() => handleSelectVariant(variant)}>
          <div
            className={cn(
              "w-12 h-12 max-h-12 rounded-full grid place-items-center overflow-hidden outline-[1px] outline-transparent outline-dashed outline-offset-2 cursor-pointer transition-all duration-75 ease-in",
              {
                "outline-main-primary": slug ? slug === variant.slug : i == 0,
              }
            )}
          >
            <Image
              src={variant.variantImage}
              alt={`product variant `}
              width={60}
              height={60}
              className="w-12 h-12 rounded-full object-cover object-center"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
