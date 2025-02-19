"use client";

import { ProductVariantDataType, ReviewWithImageType } from "@/lib/types";
import AddReview from "../../forms/add-review";
import { useState } from "react";

interface AddReviewProps {
  productId: string;
  rating: number;
  variantsInfo: ProductVariantDataType[];
  numReviews: number;
}

const defaultData = {
  ratingStatistics: [
    { rating: 1, numReviews: 0, percentage: 0 },
    { rating: 2, numReviews: 0, percentage: 0 },
    { rating: 3, numReviews: 0, percentage: 0 },
    { rating: 4, numReviews: 0, percentage: 0 },
    { rating: 5, numReviews: 0, percentage: 0 },
  ],
  reviewsWithImagesCount: 0,
  totalReviews: 0,
};

export default function Reviews({
  productId,
  numReviews,
  rating,
  variantsInfo,
}: AddReviewProps) {
  const [review, setReviews] = useState<ReviewWithImageType[]>([]);
  const [averageRating, setAverageRating] = useState<number>(rating);
  const [statistics, setStatistics] = useState(defaultData);

  return (
    <div className="pt-6" id="reviews">
      <div>
        <div className="h-12">
          <h2 className="text-main-primary text-2xl font-bold">
            Custom Reviews 4
          </h2>
        </div>
      </div>

      <div className="mt-10">
        <AddReview
          productId={productId}
          variantsInfo={variantsInfo}
          reviews={review}
          setReviews={setReviews}
          setAverageRating={setAverageRating}
        />
      </div>
    </div>
  );
}
