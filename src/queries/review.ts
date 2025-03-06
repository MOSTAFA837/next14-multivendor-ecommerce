"use server";

import { db } from "@/lib/db";
import { ReviewDetailsType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getRatingStats } from "./product";

export const upsertReview = async (
  productId: string,
  review: ReviewDetailsType
) => {
  try {
    const user = await currentUser();

    if (!user) throw new Error("Unauthenticated.");
    if (!productId) throw new Error("Product ID is required.");
    if (!review) throw new Error("Please provide review data.");

    const existingReview = await db.review.findFirst({
      where: {
        productId,
        userId: user.id,
        variant: review.variant,
      },
    });

    let review_data: ReviewDetailsType = review;

    if (existingReview) {
      review_data = { ...review_data, id: existingReview.id };
    }

    const upsertedReview = await db.review.upsert({
      where: {
        id: review_data.id,
      },
      update: {
        ...review_data,
      },
      create: {
        ...review_data,
        userId: user.id,
        productId,
      },
      include: { user: true },
    });

    const productReviews = await db.review.findMany({
      where: {
        productId,
      },
      select: {
        rating: true,
      },
    });

    const totalRating = productReviews.reduce(
      (acc, rev) => acc + rev.rating,
      0
    );

    const averageRating = totalRating / productReviews.length;

    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        rating: averageRating,
        numReviews: productReviews.length,
      },
    });

    const statistics = await getRatingStats(productId);

    console.log(statistics);

    const message = existingReview
      ? "Your review has been updated successfully!"
      : "Thank you for submitting your review!";

    return {
      review: upsertedReview,
      rating: averageRating,
      statistics,
      message,
    };
  } catch (error) {
    throw error;
  }
};

// Helpers
// export const getRatingStats = async (productId: string) => {
//   const ratingStats = await db.review.groupBy({
//     by: ["rating"],
//     where: {
//       productId,
//     },
//     _count: {
//       rating: true,
//     },
//   });

//   const totalReviews = ratingStats.reduce(
//     (sum, stat) => sum + stat._count.rating,
//     0
//   );

//   const ratingCounts = Array(5).fill(0);

//   ratingStats.forEach((stat) => {
//     let rating = Math.floor(stat.rating);

//     if (rating >= 1 && rating <= 5) {
//       ratingCounts[rating - 1] = stat._count.rating;
//     }
//   });

//   console.log(ratingStats);

//   return {
//     ratingStats: ratingCounts.map((count, index) => ({
//       rating: index + 1,
//       numReviews: count,
//       percentage: (count / totalReviews) * 100,
//     })),
//     totalReviews,
//   };
// };
