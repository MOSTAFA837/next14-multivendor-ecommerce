import {
  getAllStoreProducts,
  // getProductPageData,
  getProducts,
  getShippingDetails,
  retrieveProductDetails,
  retrieveProductDetailsOptimized,
} from "@/queries/product";
import { getStoreShippingDetails } from "@/queries/store";
import { getAllSubCategories } from "@/queries/subCategory";
import {
  Cart,
  CartItem,
  Category,
  FreeShipping,
  FreeShippingCountry,
  Prisma,
  Country as CountryPrisma,
  ProductVariantImage,
  Review,
  ShippingAddress,
  ShippingFeeMethod,
  ShippingRate,
  Size,
  Spec,
  SubCategory,
  User,
  Coupon,
  Store,
} from "@prisma/client";

import countries from "@/data/countries.json";
import { getRatingStats } from "@/queries/product";

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
  variantImage: string;
  categoryId: string;
  offerTagId: string;
  subCategoryId: string;
  isSale: boolean;
  saleEndDate?: string;
  brand: string;
  sku: string;
  weight: number;
  colors: { id?: string; color: string }[];
  sizes: {
    id?: string;
    size: string;
    quantity: number;
    price: number;
    discount: number;
  }[];
  product_specs: { id?: string; name: string; value: string }[];
  variant_specs: { id?: string; name: string; value: string }[];
  keywords: string[];
  questions: { id?: string; question: string; answer: string }[];
  freeShippingForAllCountries: boolean;
  freeShippingCountriesIds: { id?: string; label: string; value: string }[];
  shippingFeeMethod: ShippingFeeMethod;
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

export type CategoryWithSubCategories = Category & {
  subCategories: SubCategory[];
};

export type SelectMenuOption = (typeof countries)[number];

export type ProductType = Prisma.PromiseReturnType<
  typeof getProducts
>["products"][0];

export type VariantSimplified = {
  variantId: string;
  variantSlug: string;
  variantName: string;
  images: ProductVariantImage[];
  sizes: Size[];
};

export type VariantImageType = {
  url: string;
  image: string;
};

export type ProductPageType = Prisma.PromiseReturnType<
  typeof retrieveProductDetails
>;

// export type ProductPageDataType = Prisma.PromiseReturnType<
//   typeof getProductPageData
// >;

export type ProductVariantDataType = {
  id: string;
  variantName: string;
  slug: string;
  sku: string;
  variantImage: string;
  weight: number;
  isSale: boolean;
  saleEndDate: string | null;
  variantDescription: string | null;
  images: {
    url: string;
  }[];
  sizes: Size[];
  specs: Spec[];
  colors: { name: string }[];
  keywords: string;
};

export type ProductDataType = Prisma.PromiseReturnType<
  typeof retrieveProductDetailsOptimized
>;

export type ProductShippingDetailsType = Prisma.PromiseReturnType<
  typeof getShippingDetails
>;

export interface Country {
  name: string;
  code: string;
  city: string;
  region: string;
}

export type ShippingDetailsType = {
  countryCode: string;
  countryName: string;
  city: string;
  shippingFeeMethod: string;
  shippingFee: number;
  extraShippingFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  shippingService: string;
  returnPolicy: string;
  isFreeShipping: boolean;
};

export type FreeShippingWithCountriesType = FreeShipping & {
  eligibaleCountries: FreeShippingCountry[];
};

export type CartProductType = {
  productId: string;
  variantId: string;
  productSlug: string;
  variantSlug: string;
  name: string;
  variantName: string;
  image: string;
  variantImage: string;
  sizeId: string;
  size: string;
  quantity: number;
  price: number;
  stock: number;
  weight: number;
  shippingMethod: string;
  shippingService: string;
  shippingFee: number;
  extraShippingFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  isFreeShipping: boolean;
};

export type ReviewWithImageType = Review & {
  user: User;
};

export type ReviewDetailsType = {
  id: string;
  review: string;
  rating: number;
  size: string;
  quantity: string;
  variant: string;
  variantImage: string;
  color: string;
};

export type RatingStatisticsType = Prisma.PromiseReturnType<
  typeof getRatingStats
>;

export type ReviewsFiltersType = {
  rating?: number;
};

export type ReviewsOrderType = {
  orderBy: "latest" | "oldest" | "highest";
};

export type StatisticsCardType = Prisma.PromiseReturnType<
  typeof getRatingStats
>["ratingStats"];

export type SortOrder = "asc" | "desc";

export type CartWithCartItemsType = Cart & {
  items: CartItem[];
  coupon: (Coupon & { store: Store }) | null;
};

export type UserShippingAddressType = ShippingAddress & {
  country: CountryPrisma;
  user: User;
};

export interface SearchResult {
  name: string;
  link: string;
  image: string;
}
