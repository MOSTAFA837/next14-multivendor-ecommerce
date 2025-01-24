import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";
import CategoriesContainer from "./container";

export default async function CategoriesHeader() {
  const categories = await getAllCategories();
  const offerTags = await getAllOfferTags();

  return (
    <div className="w-full pt-2 pb-3 px-0">
      <CategoriesContainer categories={categories} offerTags={offerTags} />
    </div>
  );
}
