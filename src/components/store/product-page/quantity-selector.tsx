import { useCartStore } from "@/cart/useCart";
import useFromStore from "@/hooks/useFromStore";
import { CartProductType } from "@/lib/types";
import { Size } from "@prisma/client";
import { stat } from "fs";
import { Minus, Plus } from "lucide-react";
import { useEffect } from "react";

interface QuantitySelectorProps {
  productId: string;
  variantId: string;
  sizeId: string | null;
  quantity: number;
  stock: number;
  handleChange: (property: keyof CartProductType, value: any) => void;
  sizes: Size[];
}

export default function QuantitySelector({
  productId,
  variantId,
  sizeId,
  quantity,
  stock,
  handleChange,
  sizes,
}: QuantitySelectorProps) {
  // Ensure hooks are called at the top level, even before conditions or early returns
  const cart = useFromStore(useCartStore, (state) => state.cart);

  // Avoid conditional hook calls
  const maxQty =
    cart && sizeId
      ? (() => {
          const search_product = cart?.find(
            (p) =>
              p.productId === productId &&
              p.variantId === variantId &&
              p.sizeId === sizeId
          );
          return search_product
            ? search_product.stock - search_product.quantity
            : stock;
        })()
      : stock; // Default to stock if no cart or sizeId

  useEffect(() => {
    handleChange("quantity", 1);
  }, [sizeId]);

  const handleIncrease = () => {
    if (quantity < maxQty) handleChange("quantity", quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) handleChange("quantity", quantity - 1);
  };

  return (
    <div className="w-full p-2 bg-white border border-gray-200 rounded-lg">
      <div className="w-full flex justify-between items-center gap-x-5">
        <div className="grow">
          <span className="block text-xs text-gray-500">Select Quantity</span>
          <span className="block text-xs text-gray-500">
            {maxQty !== stock &&
              `(You already have ${
                stock - maxQty
              } pieces of this product in cart)`}
          </span>

          <input
            type="number"
            className="w-full p-0 bg-transparent border-0 focus:outline-1 text-gray-800"
            min={1}
            value={maxQty <= 0 ? 0 : quantity}
            max={maxQty}
            readOnly
          />
        </div>

        <div className="flex justify-end items-center gap-x-1.5">
          <button
            className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleDecrease}
            disabled={quantity === 1}
          >
            <Minus className="w-6 h-6" />
          </button>

          <button
            className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleIncrease}
            disabled={quantity === stock}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
