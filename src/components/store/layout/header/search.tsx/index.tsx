"use client";

import { SearchResult } from "@/lib/types";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useState } from "react";
import SearchSuggestions from "./suggestions";

export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);
  const { push, replace } = useRouter();

  const search_query_url = params.get("search");

  const [searchQuery, setSearchQuery] = useState<string>(
    search_query_url || ""
  );

  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);

  const [open, setOpen] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (pathname !== "/browse") {
      push(`/browse?search=${searchQuery}`);
    } else {
      if (!searchQuery) {
        params.delete("search");
      } else {
        params.set("search", searchQuery);
      }

      replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearchQuery(value);

    if (pathname === "/browse") return;

    if (value.length >= 2) {
      try {
        const res = await fetch(`/api/search-products?search=${value}`);
        const data = await res.json();
        setOpen(true);
        setSuggestions(data);
      } catch (error) {}
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative max-w-full flex-1">
      <form
        onSubmit={handleSubmit}
        className="h-10 w-full rounded-3xl bg-white relative border flex"
      >
        <input
          type="text"
          placeholder="Search..."
          className="bg-white text-black flex-1 border-none pl-2.5 m-2.5 outline-none"
          value={searchQuery}
          onChange={handleInputChange}
          onBlur={() => setOpen(false)}
          onMouseEnter={() => setOpen(true)}
        />

        {suggestions.length > 0 && open && (
          <SearchSuggestions
            open={open}
            setOpen={setOpen}
            suggestions={suggestions}
            query={searchQuery}
          />
        )}

        <button
          type="submit"
          className="border-[1px] rounded-[20px] w-[56px] h-8 mt-1 mr-1 mb-0 ml-0 text-white bg-gradient-to-r from-blue-400 bg-blue-700 grid place-items-center cursor-pointer"
        >
          <SearchIcon />
        </button>
      </form>
    </div>
  );
}
