import { getAllStoreProducts } from "@/queries/product";
import { getStoreShippingDetails } from "@/queries/store";
import { getAllSubCategories } from "@/queries/subCategory";
import { Prisma, ShippingRate } from "@prisma/client";

import countries from "@/data/countries.json";

export interface DashboardSidebarMenuInterface {
  label: string;
  icon: string;
  link: string;
}

// SubCategory + parent category
export type SubCategoryWithCategoryType = Prisma.PromiseReturnType<
  typeof getAllSubCategories
>[0];

export type ProductWithVariantType = {
  productId: string;
  variantId: string;
  name: string;
  description: string;
  variantName: string;
  variantDescription: string;
  images: { id?: string; url: string }[];
  categoryId: string;
  subCategoryId: string;
  isSale: boolean;
  saleEndDate?: string;
  offerTagId: string;
  brand: string;
  sku: string;
  weight: number;
  colors: { color: string }[];
  sizes: { size: string; quantity: number; price: number; discount: number }[];
  keywords: string[];
  product_specs: { id?: string; name: string; value: string }[];
  variant_specs: { id?: string; name: string; value: string }[];
  questions: { id?: string; question: string; answer: string }[];
  createdAt: Date;
  updatedAt: Date;
};

// Store product
export type StoreProductType = Prisma.PromiseReturnType<
  typeof getAllStoreProducts
>[0];

export type StoreShippingType = Prisma.PromiseReturnType<
  typeof getStoreShippingDetails
>;

export type CountryWithShippingRatesType = {
  countryId: string;
  countryName: string;
  shippingRate: ShippingRate;
};

export interface Country {
  name: string;
  code: string;
  city: string;
  region: string;
}

export type SelectMenuOption = (typeof countries)[number];
