import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { space } from "postcss/lib/list";

interface SimplifiedSize {
  id: string;
  size: string;
  quantity: number;
  price: number;
  discount: number;
}

interface Props {
  sizeId?: string | undefined;
  sizes: SimplifiedSize[];
  isCard?: boolean;
}

export default function ProductPrice({ sizeId, sizes, isCard }: Props) {
  if (!sizes || sizes.length === 0) {
    return;
  }

  if (!sizeId) {
    const discountedPrices = sizes.map(
      (size) => size.price * (1 - size.discount / 100)
    );

    const totalQuantity = sizes.reduce(
      (total, size) => total + size.quantity,
      0
    );

    const minPrice = Math.min(...discountedPrices).toFixed(2);
    const maxPrice = Math.max(...discountedPrices).toFixed(2);

    const priceDisplay =
      minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`;

    let discount = 0;

    if (minPrice === maxPrice) {
      let checkDiscount = sizes.find((size) => size.discount > 0);
      if (checkDiscount) {
        discount = checkDiscount.discount;
      }
    }

    return (
      <div>
        <div className="text-orange-primary inline-block font-bold leading-none mr-2.5">
          <span
            className={cn("inline-block text-4xl text-nowrap", {
              "text-lg": isCard,
            })}
          >
            {priceDisplay}
          </span>
        </div>

        {!sizeId && !isCard && (
          <>
            <div className="text-orange-background text-xs leading-4 mt-1 ">
              <span>Note : Select a size to see the exact price</span>
            </div>

            <p className="mt-2 text-xs">{totalQuantity} pieces</p>
          </>
        )}
      </div>
    );
  }

  const selectedSize = sizes.find((size) => size.id === sizeId);

  if (!selectedSize) return <></>;

  const discountedPrice =
    selectedSize.price * (1 - selectedSize.discount / 100);

  return (
    <div>
      <div className="text-orange-primary inline-block font-bold leading-none mr-2.5">
        <span className="inline-block text-4xl">
          ${discountedPrice.toFixed(2)}
        </span>
      </div>

      {selectedSize.price !== discountedPrice && (
        <span className="text-[#999] inline-block text-xl font-normal leading-6 mr-2 line-through">
          {selectedSize.price.toFixed(2)}
        </span>
      )}

      {selectedSize.discount > 0 && (
        <span className="inline-block text-orange-secondary text-xl leading-6">
          {selectedSize.discount} % off
        </span>
      )}

      <p className="mt-2 text-xs">{selectedSize.quantity} pieces</p>
    </div>
  );
}
