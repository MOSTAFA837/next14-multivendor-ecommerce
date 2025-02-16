import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Truck } from "lucide-react";

import { ProductShippingDetailsType, ShippingDetailsType } from "@/lib/types";
import { BarLoader, BounceLoader, MoonLoader } from "react-spinners";
import { getMonthDay, getShippingDateRange } from "@/lib/utils";
import { min } from "date-fns";
import ShippingFee from "./shipping-fee";

interface ShippingDetailsProps {
  shippingDetails: ProductShippingDetailsType;
  countryName: string;
  quantity: number;
  weight: number;
  loading: boolean;
}

export default function ShippingDetails({
  shippingDetails,
  countryName,
  quantity,
  weight,
  loading,
}: ShippingDetailsProps) {
  const [shippingTotal, setShippingTotal] = useState<number>();

  const [toggle, setToggle] = useState(true);

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

  const {
    isFreeShipping,
    shippingFee = 0,
    extraShippingFee = 0,
    shippingFeeMethod = "Loading...",
    shippingService = "Loading...",
    deliveryTimeMin = 0,
    deliveryTimeMax = 0,
  } = shippingDetails || {};

  const { minDate, maxDate } = shippingDetails
    ? getShippingDateRange(deliveryTimeMin, deliveryTimeMax)
    : { minDate: "Loading...", maxDate: "Loading..." };

  return (
    <div className="overflow-hidden ">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1">
            <Truck className="w-4" />

            {isFreeShipping ? (
              <span className="text-sm font-bold flex items-center">
                <span>
                  Free Shipping to&nbsp;
                  <span>{!loading ? <BarLoader /> : countryName}</span>
                </span>
              </span>
            ) : (
              <span className="text-sm font-bold flex items-center">
                <span>Shipping to {countryName}</span>
                <span className="flex items-center">
                  &nbsp;for $&nbsp;
                  {loading ? (
                    <MoonLoader size={12} color="#e5e5e5" />
                  ) : (
                    shippingTotal
                  )}
                </span>
              </span>
            )}
          </div>
          <ChevronRight className="w-3" />
        </div>

        <span className="flex items-center text-sm ml-5">
          Service:&nbsp;
          <strong className="text-sm">
            {loading ? (
              <BarLoader width={100} color="#e5e5e5" className="rounded-full" />
            ) : (
              shippingService
            )}
          </strong>
        </span>

        <span className="flex items-center text-sm ml-5">
          Delivery:&nbsp;
          <strong className="text-sm">
            {loading ? (
              <BarLoader width={180} color="#e5e5e5" className="rounded-full" />
            ) : (
              `${getMonthDay(minDate)} ~ ${getMonthDay(maxDate)}`
            )}
          </strong>
        </span>

        {!isFreeShipping && shippingDetails && toggle && (
          <ShippingFee
            fee={shippingFee}
            extraFee={extraShippingFee}
            method={shippingFeeMethod}
            quantity={quantity}
            weight={weight}
          />
        )}

        <div
          onClick={() => setToggle((prev) => !prev)}
          className="max-w-[calc(100%-2rem)] m-4 flex items-center bg-gray-100 hover:bg-gray-200 h-5 cursor-pointer"
        >
          <div className="w-full flex items-center justify-between gap-x-1 px-2">
            <span className="text-xs">{toggle ? "Hide" : "Show"}</span>
            {toggle ? (
              <ChevronUp className="w-4" />
            ) : (
              <ChevronDown className="w-4" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
