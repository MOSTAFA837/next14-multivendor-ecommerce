"use client";

import { useCartStore } from "@/cart/useCart";
import useFromStore from "@/hooks/useFromStore";
import { CartProductType, Country } from "@/lib/types";
import EmptyCart from "./empty-cart";
import { useState } from "react";
import CountryNote from "../shared/country-note";
import CartProduct from "../cards/cart-product";
import CartHeader from "./header";
import CartSummary from "./summary";
import FastDelivery from "../cards/fast-delivery";
import ReturnPrivacy, {
  SecurityPrivacyCard,
} from "../product-page/return-privacy";

export default function CartContainer({
  userCountry,
}: {
  userCountry: Country;
}) {
  const cartItems = useFromStore(useCartStore, (state) => state.cart) || [];

  const [selectedItems, setSelectedItems] = useState<CartProductType[]>([]);
  const [totalShipping, setTotalShipping] = useState<number>(0);

  return (
    <div>
      {cartItems && cartItems.length > 0 ? (
        <div className="bg-[#f5f5f5] min-h-[calc(100vh-65px)] px-2">
          <div className="max-w-[1200px] mx-auto py-4 flex flex-col gap-y-4 lg:flex-row">
            <div className="min-w-0 flex-1">
              {/* Cart header */}
              <CartHeader
                cartItems={cartItems}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
              />

              <div className="my-2">
                <CountryNote country={userCountry.name} />
              </div>

              <div className="h-auto overflow-x-hidden overflow-auto mt-2">
                {cartItems.map((product) => (
                  <CartProduct
                    key={`${product.productSlug}-${product.variantSlug}`}
                    product={product}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    setTotalShipping={setTotalShipping}
                    userCountry={userCountry}
                  />
                ))}
              </div>
            </div>

            {/* Cart side */}
            <div className="sticky top-4 lg:ml-5 w-full lg:w-[380px] max-h-max">
              <CartSummary cartItems={cartItems} shippingFees={totalShipping} />

              <div className="mt-2 p-4 bg-white px-6">
                <FastDelivery />
              </div>

              <div className="mt-2 p-4 bg-white px-6">
                <SecurityPrivacyCard />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyCart />
      )}
    </div>
  );
}
