import {
  Country,
  FreeShippingWithCountriesType,
  ShippingDetailsType,
} from "@/lib/types";
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";
import { useEffect, useState } from "react";
import { getShippingDetails } from "@/queries/product";
import { Store } from "@prisma/client";
import ReturnPrivacy from "./return-privacy";

interface ActionsProps {
  userCountry: Country;
  shippingFeeMethod: string;
  store: Store;
  weight: number;
  freeShipping: FreeShippingWithCountriesType | null;
}

export default function Actions({
  userCountry,
  shippingFeeMethod,
  store,
  weight,
  freeShipping,
}: ActionsProps) {
  const [shippingDetails, setShippingDetails] =
    useState<ShippingDetailsType | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getShippingDetailsHandler = async () => {
      const data = await getShippingDetails(
        shippingFeeMethod,
        userCountry,
        store,
        freeShipping
      );

      if (data) {
        setShippingDetails(data);
        setLoading(false);
      } else {
        setShippingDetails(null);
      }
    };

    getShippingDetailsHandler();
  }, [freeShipping, shippingFeeMethod, store, userCountry]);

  return (
    <div className="bg-white border rounded-md overflow-hidden overflow-y-auto p-4 pb-0">
      <>
        <ShipTo userCountry={userCountry} />

        <div className="mt-3 space-y-3">
          {shippingDetails && (
            <ShippingDetails
              shippingDetails={shippingDetails}
              countryName={userCountry.name}
              quantity={2}
              weight={weight}
              loading={loading}
            />
          )}
        </div>

        <ReturnPrivacy
          returnPolicy={shippingDetails?.returnPolicy}
          loading={loading}
        />
      </>
    </div>
  );
}
