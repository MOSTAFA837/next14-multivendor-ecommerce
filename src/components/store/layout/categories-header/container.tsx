"use client";

import { useState } from "react";
import { Category, OfferTag } from "@prisma/client";
import { CategoriesMenu } from "./categories-menu";
import { CategoryWithSubCategories } from "@/lib/types";

interface CategoriesContainerProps {
  categories: CategoryWithSubCategories[];
  offerTags: OfferTag[];
}

export default function CategoriesContainer({
  categories,
  offerTags,
}: CategoriesContainerProps) {
  return (
    <div className="w-full px-4 flex items-center justify-center gap-x-1">
      <CategoriesMenu categories={categories} offerTags={offerTags} />
    </div>
  );
}
