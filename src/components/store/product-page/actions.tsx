import {
  CartProductType,
  Country,
  FreeShippingWithCountriesType,
  ShippingDetailsType,
} from "@/lib/types";
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";
import { useEffect, useState } from "react";
import { getShippingDetails } from "@/queries/product";
import { Size, Store } from "@prisma/client";
import ReturnPrivacy from "./return-privacy";
import QuantitySelector from "./quantity-selector";

interface ActionsProps {
  userCountry: Country;
  shippingFeeMethod: string;
  store: Store;
  weight: number;
  freeShipping: FreeShippingWithCountriesType | null;
  sizeId?: string;
  productToCart: CartProductType;
  sizes: Size[];
  handleChange: (property: keyof CartProductType, value: any) => void;
}

export default function Actions({
  userCountry,
  shippingFeeMethod,
  store,
  weight,
  freeShipping,
  sizeId,
  productToCart,
  sizes,
  handleChange,
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
    <div className="bg-white border rounded-md  overflow-y-auto p-4 pb-0">
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

      <div className="mt-5 bg-white bottom-0 pb-4 space-y-3 sticky">
        {sizeId && (
          <div className="w-full flex justify-end mt-4">
            <QuantitySelector
              productId={productToCart.productId}
              variantId={productToCart.variantId}
              sizeId={productToCart.sizeId}
              quantity={productToCart.quantity}
              stock={productToCart.stock}
              handleChange={handleChange}
              sizes={sizes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
