"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { CategoryWithSubCategories } from "@/lib/types";
import { OfferTag } from "@prisma/client";

interface CategoriesMenuProps {
  categories: CategoryWithSubCategories[];
  offerTags: OfferTag[];
}

export function CategoriesMenu({ categories, offerTags }: CategoriesMenuProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {categories.map((category) => (
          <NavigationMenuItem key={category.id}>
            <NavigationMenuTrigger className="capitalize">
              {category.name}
            </NavigationMenuTrigger>

            <NavigationMenuContent>
              <ul className="w-[400px] grid gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {category.subCategories.map((subCategory) => (
                  <ListItem
                    key={subCategory.id}
                    title={subCategory.name}
                    href={subCategory.url}
                    className="hover:bg-gray-200 capitalize"
                  />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}

        <NavigationMenuItem>
          <NavigationMenuTrigger className="capitalize">
            Offers
          </NavigationMenuTrigger>

          <NavigationMenuContent>
            <ul className="w-[400px] grid gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {offerTags.map((offerTag) => (
                <ListItem
                  key={offerTag.id}
                  title={offerTag.name}
                  href={offerTag.url}
                  className="hover:bg-gray-200 capitalize"
                />
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
