import { Country, ShippingDetailsType } from "@/lib/types";
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";
import { useEffect, useState } from "react";
import { getShippingDetails } from "@/queries/product";
import { Store } from "@prisma/client";

interface ActionsProps {
  userCountry: Country;
  shippingFeeMethod: string;
  store: Store;
}

export default function Actions({
  userCountry,
  shippingFeeMethod,
  store,
}: ActionsProps) {
  const [shippingDetails, setShippingDetails] =
    useState<ShippingDetailsType | null>(null);

  useEffect(() => {
    const getShippingDetailsHandler = async () => {
      const data = await getShippingDetails(
        shippingFeeMethod,
        userCountry,
        store
      );

      if (data) {
        setShippingDetails(data);
      } else {
        setShippingDetails(null);
      }
    };

    getShippingDetailsHandler();
  }, [shippingFeeMethod, store, userCountry]);

  console.log("shippingDetails", shippingDetails);

  return (
    <div className="bg-white border rounded-md overflow-hidden overflow-y-auto p-4 pb-0">
      <>
        <ShipTo userCountry={userCountry} />

        <div className="mt-3 space-y-3">
          {shippingDetails && (
            <ShippingDetails
              shippingDetails={shippingDetails}
              countryName={userCountry.name}
              quantity={1}
              weight={1}
            />
          )}
        </div>
      </>
    </div>
  );
}
