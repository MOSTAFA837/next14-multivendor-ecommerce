"use client";

import {
  CartWithCartItemsType,
  Country as CountryType,
  UserShippingAddressType,
} from "@/lib/types";
import { Country, ShippingAddress } from "@prisma/client";

import { useEffect, useState } from "react";
import CheckoutProductCard from "../cards/checkout-product";
import ShippingAddresses from "../shared/shipping-address";
import PlaceOrder from "../cards/place-order";
import { updateCheckoutProductstWithLatest } from "@/queries/user";

interface Props {
  cart: CartWithCartItemsType;
  countries: Country[];
  userCountry: CountryType;
  addresses: UserShippingAddressType[];
}

export default function CheckoutContainer({
  cart,
  countries,
  userCountry,
  addresses,
}: Props) {
  const [data, setData] = useState<CartWithCartItemsType>(cart);
  const { items } = data;

  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddress | null>(null);

  const activeCountry = addresses.find(
    (add) => add.countryId === selectedAddress?.countryId
  )?.country;

  useEffect(() => {
    const hydrateCheckoutCart = async () => {
      const updatedCart = await updateCheckoutProductstWithLatest(
        items,
        activeCountry
      );

      setData(updatedCart);
    };

    if (items.length > 0) {
      hydrateCheckoutCart();
    }
  }, [activeCountry]);

  return (
    <div className="w-full flex flex-col gap-y-2 lg:flex-row">
      <div className="space-y-2 lg:flex-1">
        <ShippingAddresses
          addresses={addresses}
          countries={countries}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
        />

        {items.map((product) => (
          <CheckoutProductCard
            key={product.variantId}
            product={product}
            isDiscounted={data.coupon?.storeId === product.storeId}
          />
        ))}
      </div>

      <PlaceOrder
        cartData={data}
        setCartData={setData}
        shippingAddress={selectedAddress}
      />
    </div>
  );
}
