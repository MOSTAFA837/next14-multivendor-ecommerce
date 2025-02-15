import { Size } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

interface Props {
  sizes: Size[];
  sizeId: string | undefined;
  setSizeId: Dispatch<SetStateAction<string>>;
}

export default function SizeSelector({ sizeId, setSizeId, sizes }: Props) {
  const handleSelectSize = (size: Size) => {
    setSizeId(size.id);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {sizes.map((size) => (
        <span
          key={size.size}
          className={`border rounded-full px-5 py-1 cursor-pointer transition-all hover:bg-orange-background hover:text-white ${
            size.id === sizeId ? "bg-orange-background text-white" : ""
          }`}
          onClick={() => handleSelectSize(size)}
        >
          {size.size}
        </span>
      ))}
    </div>
  );
}
