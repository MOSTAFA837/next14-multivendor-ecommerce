"use client";

import {
  CartProductType,
  Country,
  ProductDataType,
  ProductVariantDataType,
} from "@/lib/types";
import { ReactNode, useEffect, useMemo, useState } from "react";
import ProductSwiper from "./swiper";
import ProductInfo from "./info";
import Actions from "../actions";
import { isProductValidToAdd } from "@/lib/utils";
import { useCartStore } from "@/cart/useCart";
import useFromStore from "@/hooks/useFromStore";

interface ProductPageContainerProps {
  productData: ProductDataType;
  variantSlug: string;
  userCountry: Country;
  children: ReactNode;
}

export default function ProductPageContainer({
  children,
  productData,
  userCountry,
  variantSlug,
}: ProductPageContainerProps) {
  const { id, variants, slug, freeShipping } = productData;

  const [variant, setVariant] = useState<ProductVariantDataType>(
    variants.find((v) => v.slug === variantSlug) || variants[0]
  );

  useEffect(() => {
    const variant = variants.find((v) => v.slug === variantSlug);
    if (variant) {
      setVariant(variant);
    }
  }, [variantSlug, variants]);

  const [sizeId, setSizeId] = useState(
    variant.sizes.length === 1 ? variant.sizes[0].id : ""
  );

  const {
    id: variantId,
    images,
    variantName,
    variantImage,
    weight,
    sizes,
  } = variant;

  const [activeImage, setActiveImage] = useState<{ url: string } | null>(
    images[0]
  );

  // initialize the default product data for the cart item
  const data: CartProductType = {
    productId: id,
    variantId,
    productSlug: slug,
    variantSlug,
    name: productData.name,
    variantName,
    image: images[0].url,
    variantImage,
    sizeId: sizeId || "",
    size: "",
    quantity: 1,
    price: 0,
    stock: 1,
    weight,
    shippingMethod: productData.shippingFeeMethod,
    shippingService: "",
    shippingFee: 0,
    extraShippingFee: 0,
    deliveryTimeMin: 0,
    deliveryTimeMax: 0,
    isFreeShipping: false,
  };

  const [productToCart, setProductToCart] = useState<CartProductType>(data);
  const [isProductValid, setIsProductValid] = useState<boolean>(false);

  const handleChange = (property: keyof CartProductType, value: any) => {
    setProductToCart((prev) => ({ ...prev, [property]: value }));
  };

  useEffect(() => {
    const check = isProductValidToAdd(productToCart);

    if (check !== isProductValid) {
      setIsProductValid(check);
    }
  }, [isProductValid, productToCart]);

  useEffect(() => {
    setProductToCart((prevProduct) => ({
      ...prevProduct,
      productId: id,
      variantId,
      productSlug: slug,
      variantSlug: variant.slug,
      name: productData.name,
      variantName: variantName,
      image: images[0].url,
      variantImage: variantImage,
      stock: variant.sizes.find((s) => s.id === sizeId)?.quantity || 1,
      weight: weight,
    }));
  }, [
    id,
    slug,
    variantSlug,
    variant,
    productData,
    variantName,
    variantImage,
    weight,
    images,
    sizeId,
    variantId,
  ]);

  const cartItems = useFromStore(useCartStore, (state) => state.cart);

  const maxQty = useMemo(() => {
    const search_product = cartItems?.find(
      (p) =>
        p.productId === id && p.variantId === variantId && p.sizeId === sizeId
    );
    return search_product
      ? search_product.stock - search_product.quantity
      : productToCart.stock;
  }, [cartItems, productToCart.stock, id, variantId, sizeId]);

  // Get the set Cart action to update items in cart
  const setCart = useCartStore((state) => state.setCart);

  // Keeping cart state updated
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Check if the "cart" key was changed in localStorage
      if (event.key === "cart") {
        try {
          const parsedValue = event.newValue
            ? JSON.parse(event.newValue)
            : null;

          // Check if parsedValue and state are valid and then update the cart
          if (
            parsedValue &&
            parsedValue.state &&
            Array.isArray(parsedValue.state.cart)
          ) {
            setCart(parsedValue.state.cart);
          }
        } catch (error) {}
      }
    };

    // Attach the event listener
    window.addEventListener("storage", handleStorageChange);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div className="relative">
      <div className="w-full xl:flex xl:gap-4">
        <div className="w-full flex-1">
          <ProductSwiper
            images={images}
            activeImage={activeImage || images[0]}
            setActiveImage={setActiveImage}
          />
        </div>

        <div className="w-full mt-4 md:mt-0 flex flex-col gap-4 lg:flex-row">
          <ProductInfo
            productData={productData}
            variant={variant}
            setVariant={setVariant}
            variantSlug={variantSlug}
            sizeId={sizeId}
            setSizeId={setSizeId}
            setActiveImage={setActiveImage}
            handleChange={handleChange}
          />

          {/* shipping details - buy actions buttons */}
          <div className="w-full lg:w-[390px]">
            <Actions
              userCountry={userCountry}
              shippingFeeMethod={productData.shippingFeeMethod}
              store={productData.store}
              weight={weight}
              freeShipping={freeShipping}
              sizeId={sizeId}
              productToCart={productToCart}
              handleChange={handleChange}
              sizes={sizes}
              isProductValid={isProductValid}
              productData={productData}
              variantSlug={variantSlug}
              variantName={variantName}
              maxQty={maxQty}
              productId={id}
              variantId={variantId}
            />
          </div>
        </div>
      </div>

      <div
        id="children-container"
        className="lg:w-[calc(100%-410px)] mt-6 pb-16"
      >
        {children}
      </div>
    </div>
  );
}
