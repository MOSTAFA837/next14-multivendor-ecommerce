import React from "react";
import ForkedContentLoader from "../../cards/skeleton";

export default function ProductPageRelatedSkeleton() {
  const loaders = [];

  for (let i = 0; i < 6; i++) {
    loaders.push(
      <ForkedContentLoader
        key={i}
        height={190}
        width={200}
        backgroundColor="#9ca3af"
        className="rounded-md "
      >
        <rect
          x="0"
          y="0"
          height={190}
          width={200}
          className="w-48 sm:w-[200px] rounded-md"
        />
      </ForkedContentLoader>
    );
  }

  return <div className="pl-4 flex gap-2">{loaders}</div>;
}
