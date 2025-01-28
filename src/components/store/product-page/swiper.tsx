"use client";

import { useState } from "react";
import { ProductVariantImage } from "@prisma/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ImageZoom from "react-image-zooom";

interface ProductSwiperProps {
  images: ProductVariantImage[];
}

export default function ProductSwiper({ images }: ProductSwiperProps) {
  //   if (!images) return null;

  const [activeImage, setActiveImage] = useState<ProductVariantImage>(
    images[0]
  );

  return (
    <div className="relative xl:w-[25vw] swiper1700width">
      <div className="relative w-full flex 2xl:flex-row gap-2">
        {/* Thumbnails */}
        <div className="flex flex-col">
          {images.map((img) => (
            <div
              key={img.url}
              className={cn(
                "w-16 h-16 rounded-md grid place-items-center overflow-hidden border border-gray-100 cursor-pointer transition-all duration-75 ease-in",
                {
                  "border-main-primary": activeImage
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
        <div className="relative rounded-lg overflow-hidden flex flex-grow min-h-[500px] w-full h-full">
          <ImageZoom
            src={activeImage ? activeImage.url : ""}
            zoom={200}
            className="!min-w-full rounded-lg flex flex-grow h-fit"
          />
        </div>
      </div>
    </div>
  );
}
