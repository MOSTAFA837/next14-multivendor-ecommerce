import { getAllStoreProducts } from "@/queries/product";
import { getAllSubCategories } from "@/queries/subCategory";
import { Prisma } from "@prisma/client";

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
  brand: string;
  sku: string;
  colors: { color: string }[];
  sizes: { size: string; quantity: number; price: number; discount: number }[];
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type StoreProductType = Prisma.PromiseReturnType<
  typeof getAllStoreProducts
>[0];
