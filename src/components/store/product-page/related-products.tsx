"use client";

import { useEffect, useState } from "react";
import { ProductType } from "@/lib/types";
import { getRelatedProducts } from "@/queries/product";
import ProductList from "../shared/product-list";
import ProductPageRelatedSkeleton from "../skeletons/product-page/related";

interface RelatedProductsProps {
  productId: string;
  categoryId: string;
  subCategoryId: string;
}

export default function RelatedProducts({
  categoryId,
  productId,
  subCategoryId,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getRelatedProductsHandler = async () => {
      try {
        setLoading(true);

        const res = await getRelatedProducts(
          productId,
          categoryId,
          subCategoryId
        );

        setProducts(res);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getRelatedProductsHandler();
  }, [categoryId, productId, subCategoryId]);

  return (
    <div className="mt-6" id="reviews">
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">
          You Might Also Like
        </h2>
      </div>

      {loading ? (
        <ProductPageRelatedSkeleton />
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}
