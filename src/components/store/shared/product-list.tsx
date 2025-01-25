import { ProductType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "../cards/product/product-card";

interface ProductListProps {
  products: ProductType[];
  title?: string;
  link?: string;
  arrow?: boolean;
}

export default function ProductList({
  products,
  title,
  link,
  arrow,
}: ProductListProps) {
  function Title() {
    if (link) {
      <Link href={link} className="h-12">
        <h2 className="text-main-primary text-xl font-bold">
          {title}&nbsp;
          {arrow && <ChevronRight className="w-3 inline-block" />}
        </h2>
      </Link>;
    } else {
      return (
        <h2 className="text-main-primary text-xl font-bold">
          {title}&nbsp;
          {arrow && <ChevronRight className="w-3 inline-block" />}
        </h2>
      );
    }
  }

  return (
    <div className="relative">
      {title && <Title />}
      {products.length > 0 ? (
        <div className={cn("flex flex-wrap", { "mt-2": title })}>
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      ) : (
        "No Products."
      )}
    </div>
  );
}
