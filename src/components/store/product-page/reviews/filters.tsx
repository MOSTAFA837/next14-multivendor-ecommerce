import {
  RatingStatisticsType,
  ReviewsFiltersType,
  ReviewsOrderType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Dispatch, FC, SetStateAction } from "react";

interface Props {
  filters: ReviewsFiltersType;
  setFilters: Dispatch<SetStateAction<ReviewsFiltersType>>;
  stats: RatingStatisticsType;
  setSort: Dispatch<SetStateAction<ReviewsOrderType | undefined>>;
}

const ReviewsFilters: FC<Props> = ({ filters, setFilters, setSort, stats }) => {
  const { rating } = filters;
  const { ratingStats, totalReviews } = stats;
  return (
    <div className="mt-8 relative overflow-hidden">
      <div className="flex flex-wrap gap-4">
        {/* All */}
        <div
          className={cn(
            "bg-[#f5f5f5] text-main-primary border border-transparent rounded-full cursor-pointer py-1.5 px-4 xxx",
            {
              "bg-[#ffebed] text-[#fd384f] border-[#fd384f]": !rating,
            }
          )}
          onClick={() => {
            setFilters({ rating: undefined });
            setSort(undefined);
          }}
        >
          All ({totalReviews})
        </div>

        {/* Rating Filters */}
        {ratingStats.map((r) => (
          <div
            key={r.ratting}
            className={cn(
              "bg-[#f5f5f5] text-main-primary border border-transparent rounded-full cursor-pointer py-1.5 px-4",
              {
                "bg-[#ffebed] text-[#fd384f] border-[#fd384f]":
                  r.ratting === rating,
              }
            )}
            onClick={() => setFilters({ ...filters, rating: r.ratting })}
          >
            {r.ratting} stars ({r.numReviews})
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsFilters;
