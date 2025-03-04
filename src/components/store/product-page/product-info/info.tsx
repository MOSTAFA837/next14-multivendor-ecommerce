import {
  CartProductType,
  ProductDataType,
  ProductVariantDataType,
} from "@/lib/types";
import Link from "next/link";
import ReactStars from "react-rating-stars-component";
import { CopyIcon } from "../../icons";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import Countdown from "../../shared/countdown";
import { Separator } from "@/components/ui/separator";
import ColorWheel from "@/components/shared/color-wheel";
import { Dispatch, SetStateAction } from "react";
import ProductVariantSelector from "./variant-selector";
import ProductPrice from "./price";
import SizeSelector from "./size-selector";
import AssurancePolicy from "./assurance-policy";

interface ProductInfoProps {
  productData: ProductDataType;
  variant: ProductVariantDataType;
  setVariant: Dispatch<SetStateAction<ProductVariantDataType>>;
  variantSlug: string;
  sizeId: string | undefined;
  setSizeId: Dispatch<SetStateAction<string>>;
  setActiveImage: Dispatch<SetStateAction<{ url: string } | null>>;
  handleChange: (property: keyof CartProductType, value: any) => void;
}

export default function ProductInfo({
  productData,
  sizeId,
  variant,
  variantSlug,
  setSizeId,
  setVariant,
  setActiveImage,
  handleChange,
}: ProductInfoProps) {
  const { toast } = useToast();

  if (!productData) return null;

  const { name, store, rating, numReviews, variants } = productData;
  const {
    isSale,
    saleEndDate,
    colors,
    sku,
    variantName,
    variantDescription,
    sizes,
    weight,
  } = variant;

  const copySkuToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sku);

      toast({
        title: "Copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy to clipboard",
      });
    }
  };

  return (
    <div className="relative w-full xl:w-[540px]">
      <h1 className="text-main-primary inline font-bold leading-5">
        {name} · {variantName}
      </h1>

      <div className="flex items-center text-xs mt-2">
        {/* Store details */}
        <Link href={`/store/${store.url}`} className="mr-2 hover:underline">
          <div className="w-full flex items-center gap-x-1">
            <Image
              src={store.logo}
              alt={store.name}
              width={100}
              height={100}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </Link>

        {/* Sku - Rating - Num reviews */}
        <div className="whitespace-nowrap">
          <span className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-500">
            SKU: {sku}
          </span>
          <span
            className="inline-block align-middle text-[#2F68A8] mx-1 cursor-pointer"
            onClick={copySkuToClipboard}
          >
            <CopyIcon />
          </span>
        </div>

        <div className="md:ml-4 flex items-center gap-x-2 flex-1 whitespace-nowrap">
          <ReactStars
            count={5}
            size={24}
            color="#F5F5F5"
            activeColor="#FFD804"
            value={rating}
            isHalf
            edit={false}
          />
          <Link href="#reviews" className="text-[#ffd804] hover:underline">
            (
            {numReviews === 0
              ? "No review yet"
              : numReviews === 1
              ? "1 review"
              : `${numReviews} reviews`}
            )
          </Link>
        </div>
      </div>

      <div className="my-2 relative flex flex-col sm:flex-row justify-between">
        <ProductPrice
          sizeId={sizeId}
          sizes={sizes}
          handleChange={handleChange}
        />

        {isSale && saleEndDate && (
          <div className="mt-4 pb-2">
            <Countdown targetDate={saleEndDate} />
          </div>
        )}
      </div>

      <Separator className="mt-2" />

      <div className="mt-4 space-y-2">
        <div className="relative flex items-center justify-between text-main-primary font-bold">
          <span className="flex items-center gap-x-2">
            {colors.length > 1 ? "Colors" : "Color"}
            <ColorWheel colors={colors} size={25} />
          </span>
        </div>

        <div className="mt-4">
          {variants.length > 0 && (
            <ProductVariantSelector
              variants={variants}
              slug={variant.slug}
              setSizeId={setSizeId}
              setVariant={setVariant}
              setActiveImage={setActiveImage}
            />
          )}
        </div>
      </div>

      <div className="space-y-2 pb-2 mt-4">
        <div>
          <h1 className="text-main-primary font-bold">Size </h1>
        </div>

        <SizeSelector
          sizes={variant.sizes}
          sizeId={sizeId}
          setSizeId={setSizeId}
        />
      </div>

      <Separator className="mt-2" />
      <AssurancePolicy />

      <Separator className="mt-2" />
      <div className="mt-2 flex flex-wrap gap-2">
        {variant.keywords.split(",").map((k) => (
          <span
            key={k}
            className="bg-gray-50 rounded-full px-3 py-1 text-sm text-main-secondary"
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
