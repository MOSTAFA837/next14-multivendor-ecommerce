import { ProductPageDataType } from "@/lib/types";
import Link from "next/link";
import ReactStars from "react-rating-stars-component";
import { CopyIcon } from "../icons";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import ProductPrice from "./price";
import Countdown from "../shared/countdown";

interface ProductInfoProps {
  productData: ProductPageDataType;
  sizeId: string | undefined;
}

export default function ProductInfo({ productData, sizeId }: ProductInfoProps) {
  const { toast } = useToast();

  if (!productData) return null;

  const {
    name,
    store,
    rating,
    numReviews,
    variants,
    saleEndDate,
    isSale,
    sku,
    sizes,
  } = productData;

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
      <h1 className="text-main-primary inline font-bold leading-5">{name} ·</h1>

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
        <ProductPrice sizeId={sizeId} sizes={sizes} />

        {isSale && saleEndDate && (
          <div className="mt-4 pb-2">
            <Countdown targetDate={saleEndDate} />
          </div>
        )}
      </div>
    </div>
  );
}
