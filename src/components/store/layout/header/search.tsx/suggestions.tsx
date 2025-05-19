import { SearchResult } from "@/lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, useEffect, useTransition } from "react";

interface Props {
  suggestions: SearchResult[];
  query: string;
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean>>;
}

export default function SearchSuggestions({
  suggestions,
  query,
  open,
  setOpen,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePush = (link: string) => {
    startTransition(() => {
      router.push(link);
    });
    setOpen(false); // Close the suggestions after selecting one
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text; // Return original text if query is empty

    const regex = new RegExp(`(${query})`, "gi"); // Create a regex to match the query (case insensitive)
    const parts = text.split(regex); // Split the text by the query

    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={index} className="text-orange-background">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="absolute top-11 w-full rounded-3xl bg-white text-main-primary shadow-2xl !z-[99] overflow-hidden">
      <div className="py-2">
        <ul>
          {suggestions.map((sugg) => (
            <li
              key={sugg.name}
              className="w-full h-20 px-6 cursor-pointer hover:bg-[#f5f5f5] flex items-center gap-x-2"
              onClick={() => handlePush(sugg.link)}
            >
              <Image
                src={sugg.image}
                alt=""
                width={100}
                height={100}
                className="w-16 h-16 rounded-md object-cover"
              />

              <div>
                <span className="text-sm leading-6 my-1.5 line-clamp-2 sm:line-clamp-none">
                  {highlightText(sugg.name, query)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
