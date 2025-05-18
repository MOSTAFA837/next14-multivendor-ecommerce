import { CartWithCartItemsType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ShippingAddress } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { PulseLoader } from "react-spinners";
import FastDelivery from "./fast-delivery";
import { toast } from "sonner";
import { SecurityPrivacyCard } from "../product-page/return-privacy";
import { emptyUserCart, placeOrder } from "@/queries/user";
import { useCartStore } from "@/cart/useCart";

interface Props {
  shippingAddress: ShippingAddress | null;
  cartData: CartWithCartItemsType;
  setCartData: Dispatch<SetStateAction<CartWithCartItemsType>>;
}

export default function PlaceOrder({
  shippingAddress,
  setCartData,
  cartData,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const { id, subTotal, shippingFees, total } = cartData;

  const { push } = useRouter();
  const emptyCart = useCartStore((state) => state.emptyCart);

  const handlePlaceOrder = async () => {
    setLoading(true);
    if (!shippingAddress) {
      toast.error("Select a shipping address first !");
    } else {
      const order = await placeOrder(shippingAddress, id);

      if (order) {
        emptyCart();
        await emptyUserCart();
        push(`/order/${order.orderId}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="sticky top-4 lg:ml-5 lg:w-[380px] max-h-max">
      <div className="relative py-4 px-6 bg-white">
        <h1 className="text-gray-900 text-2xl font-bold mb-4">Summary</h1>

        <Info title="Subtotal" text={`${subTotal.toFixed(2)}`} />
        <Info title="Shipping Fees" text={`+${shippingFees.toFixed(2)}`} />
        <Info title="Taxes" text="+0.00" />

        <Info title="Total" text={`+${total.toFixed(2)}`} isBold noBorder />
      </div>

      <div className="mt-2"></div>

      <div className="mt-2 p-4 bg-white">
        <Button onClick={() => handlePlaceOrder()}>
          {loading ? (
            <PulseLoader size={5} color="#fff" />
          ) : (
            <span>Place order</span>
          )}
        </Button>
      </div>

      <div className="mt-2 p-4 bg-white px-6">
        <FastDelivery />
      </div>
      <div className="mt-2 p-4 bg-white px-6">
        <SecurityPrivacyCard />
      </div>
    </div>
  );
}

const Info = ({
  title,
  text,
  isBold,
  noBorder,
}: {
  title: string;
  text: string;
  isBold?: boolean;
  noBorder?: boolean;
}) => {
  return (
    <div
      className={cn(
        "mt-2 font-medium flex items-center text-[#222] text-sm pb-1 border-b",
        {
          "font-bold": isBold,
          "border-b-0": noBorder,
        }
      )}
    >
      <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
        {title}
      </h2>
      <h3 className="flex-1 w-0 min-w-0 text-right">
        <div className="px-0.5 text-black">
          <span className="text-black text-lg inline-block break-all">
            {text}
          </span>
        </div>
      </h3>
    </div>
  );
};
