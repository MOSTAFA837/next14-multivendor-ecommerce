"use client";

import { ProductType } from "@/lib/types";
import { getProducts } from "@/queries/product";
import { FC, useEffect, useState } from "react";
import ProductList from "../shared/product-list";
import { ChevronRight } from "lucide-react";
import ProductPageRelatedSkeleton from "../skeletons/product-page/related";

interface Props {
  storeUrl: string;
  storeName: string;
  count: number;
}

const StoreProducts: FC<Props> = ({ storeUrl, count }) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStoreProducts = async () => {
    try {
      setLoading(true);

      const res = await getProducts({ store: storeUrl }, "", 1, count);
      setProducts(res.products);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6" id="reviews">
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">
          Recommended from Global Goods Marketplace
          <ChevronRight className="w-3 inline-block" />
        </h2>
      </div>

      <div className="mt-8 min-[620px]:mt-0">
        {loading ? (
          <div>
            <ProductPageRelatedSkeleton />
          </div>
        ) : (
          <ProductList products={products} />
        )}
      </div>
    </div>
  );
};

export default StoreProducts;
