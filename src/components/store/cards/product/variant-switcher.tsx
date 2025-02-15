import { VariantImageType, VariantSimplified } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

interface VariantSwitcherProps {
  images: VariantImageType[];
  variants: VariantSimplified[];
  selectedVariant: VariantSimplified;
  setVariant: Dispatch<SetStateAction<VariantSimplified>>;
  productSlug: string;
}

export default function VariantSwitcher({
  images,
  variants,
  selectedVariant,
  setVariant,
  productSlug,
}: VariantSwitcherProps) {
  return (
    <div>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {images.map((image, i) => (
            <Link
              key={i}
              href={`/product/${productSlug}?variant=${variants[i].variantSlug}`}
              className={cn("p-0.5 rounded-full border-2 border-transparent", {
                "border-border": variants[i] === selectedVariant,
              })}
              onMouseEnter={() => setVariant(variants[i])}
            >
              <Image
                src={image.image}
                alt=""
                width={100}
                height={100}
                className="w-8 h-8 object-cover rounded-full"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
