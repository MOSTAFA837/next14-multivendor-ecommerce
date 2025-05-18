"use client";

import {
  CartProductType,
  Country,
  FreeShippingWithCountriesType,
  ProductDataType,
  ShippingDetailsType,
} from "@/lib/types";
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";
import { useEffect, useState } from "react";
import { getShippingDetails } from "@/queries/product";
import { Size, Store } from "@prisma/client";
import ReturnPrivacy from "./return-privacy";
import QuantitySelector from "./quantity-selector";
import { cn } from "@/lib/utils";
import SocialShare from "../shared/social-share";
import { useCartStore } from "@/cart/useCart";
import { toast } from "sonner";
import { addToWishList, checkIfAddedToWishlist } from "@/queries/user";
import { Heart } from "lucide-react";

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
  isProductValid: boolean;
  productData: ProductDataType;
  variantSlug: string;
  variantName: string;
  productId: string;
  variantId: string;
  maxQty: number;
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
  isProductValid,
  productData,
  variantSlug,
  variantName,
  maxQty,
  productId,
  variantId,
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

  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    if (maxQty <= 0) return;

    addToCart(productToCart);
    toast.success("Product added to cart");
  };

  const cartItems = useCartStore((state) => state.cart);
  // console.log("cart", cartItems);

  const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);

  // Handle add product to wishlist
  const handleaddToWishlist = async () => {
    try {
      const res = await addToWishList(productId, variantId, sizeId);
      toast.success(res.message);
      if (res.id) {
        setIsAddedToWishlist(true);
      } else {
        setIsAddedToWishlist(false);
      }
    } catch (error: any) {
      toast.error(error.toString());
    }
  };

  useEffect(() => {
    if (!productId || !variantId || !sizeId) return;

    const checkWishlist = async () => {
      const res = await checkIfAddedToWishlist(productId, variantId, sizeId);
      setIsAddedToWishlist(res);
    };

    checkWishlist();
  }, [productId, sizeId, variantId]);

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

        <button
          onClick={() => handleaddToWishlist()}
          className={cn(
            "relative w-full flex items-center justify-center gap-x-4 py-2.5 min-w-20 bg-white hover:bg-orange-hover/70 text-orange-background border-orange-background  h-11 rounded-3xl leading-6 font-bold whitespace-nowrap border hover:text-white cursor-pointer transition-all duration-300 ease-bezier-1 select-none"
          )}
        >
          <Heart
            className={cn("", {
              "stroke-orange-seconadry fill-orange-seconadry":
                isAddedToWishlist,
            })}
          />
          <span>
            {isAddedToWishlist ? "Added to wishlist" : "Add to wishlist"}
          </span>
        </button>

        <button
          onClick={() => {
            handleAddToCart();
          }}
          className={cn(
            "relative w-full py-2.5 min-w-20 bg-orange-background hover:bg-orange-hover text-white h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none"
          )}
        >
          <span>Buy now</span>
        </button>

        <button
          onClick={handleAddToCart}
          className={cn(
            "relative w-full py-2.5 min-w-20 bg-orange-border hover:bg-[#e4cdce] text-orange-hover h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none"
          )}
        >
          <span>Add to cart</span>
        </button>

        <SocialShare
          url={`/product/${productData.slug}/${variantSlug}`}
          quote={`${productData.name} · ${variantName}`}
        />
      </div>
    </div>
  );
}
