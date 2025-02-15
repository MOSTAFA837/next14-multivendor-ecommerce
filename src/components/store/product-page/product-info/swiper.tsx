"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { ProductVariantImage } from "@prisma/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ImageZoom from "react-image-zooom";

interface ProductSwiperProps {
  images: { url: string }[];
  activeImage: { url: string } | null;
  setActiveImage: Dispatch<SetStateAction<{ url: string } | null>>;
}

export default function ProductSwiper({
  images,
  activeImage,
  setActiveImage,
}: ProductSwiperProps) {
  return (
    <div className="relative xl:w-[25vw] swiper1700width">
      <div className="relative w-full flex flex-col-reverse 2xl:flex-row gap-2">
        {/* Thumbnails */}
        <div className="flex flex-wrap 2xl:flex-col gap-3">
          {images.map((img) => (
            <div
              key={img.url}
              className={cn(
                "w-16 h-16 rounded-md grid place-items-center overflow-hidden border border-gray-100 cursor-pointer transition-all duration-75 ease-in",
                {
                  "border-black": activeImage
                    ? activeImage.url === img.url
                    : false,
                }
              )}
              onMouseEnter={() => setActiveImage(img)}
            >
              <Image
                src={img.url}
                alt={""}
                width={80}
                height={80}
                className="object-cover rounded-md"
              />
            </div>
          ))}
        </div>

        {/* Image view */}
        <div className="relative rounded-lg overflow-hidden flex flex-grow ">
          <ImageZoom
            src={activeImage ? activeImage.url : ""}
            zoom={200}
            className="!w-full rounded-lg flex flex-grow h-fit"
          />
        </div>
      </div>
    </div>
  );
}
