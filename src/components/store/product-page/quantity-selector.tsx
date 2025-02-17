import { CartProductType } from "@/lib/types";
import { Size } from "@prisma/client";
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
  useEffect(() => {
    handleChange("quantity", 1);
  }, [sizeId]);

  const handleIncrease = () => {
    if (quantity < stock) handleChange("quantity", quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) handleChange("quantity", quantity - 1);
  };

  return (
    <div className="w-full p-2 bg-white border border-gray-200 rounded-lg">
      <div className="w-full flex justify-between items-center gap-x-5">
        <div className="grow">
          <span className="block text-xs text-gray-500">Select Quantity</span>

          <input
            type="number"
            className="w-full p-0 bg-transparent border-0 focus:outline-1 text-gray-800"
            min={1}
            value={quantity}
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
