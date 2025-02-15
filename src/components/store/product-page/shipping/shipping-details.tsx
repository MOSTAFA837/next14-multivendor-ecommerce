import { ProductShippingDetailsType, ShippingDetailsType } from "@/lib/types";
import { Truck } from "lucide-react";
import { useEffect, useState } from "react";

interface ShippingDetailsProps {
  shippingDetails: ProductShippingDetailsType;
  countryName: string;
  quantity: number;
  weight: number;
}

export default function ShippingDetails({
  shippingDetails,
  countryName,
  quantity,
  weight,
}: ShippingDetailsProps) {
  const [shippingTotal, setShippingTotal] = useState<number>();

  useEffect(() => {
    if (!shippingDetails) return;

    const { shippingFee, shippingFeeMethod, extraShippingFee } =
      shippingDetails;

    switch (shippingFeeMethod) {
      case "ITEM":
        let qty = quantity - 1;
        setShippingTotal(shippingFee + qty * extraShippingFee);
        break;

      case "WEIGHT":
        setShippingTotal(shippingFee * quantity);
        break;

      case "FIXED":
        setShippingTotal(shippingFee);
        break;

      default:
        setShippingTotal(0);
        break;
    }
  }, [quantity, shippingDetails]);

  return (
    <div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1">
            <Truck className="w-4" />

            <div className="text-sm font-bold flex items-center">
              <span>
                Shipping to <span>{countryName}</span>
              </span>

              <span>&nbsp;for ${shippingTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
