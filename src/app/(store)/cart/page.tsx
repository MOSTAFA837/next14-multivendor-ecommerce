import { cookies } from "next/headers";
import { Country } from "@/lib/types";

import CartContainer from "@/components/store/cart/container";

export default function CartPage() {
  // Get cookies from the store
  const cookieStore = cookies();
  const userCountryCookie = cookieStore.get("userCountry");

  // Set default country if cookie is missing
  let userCountry: Country = {
    name: "Egypt",
    city: "",
    code: "EG",
    region: "",
  };

  // If cookie exists, update the user country
  if (userCountryCookie) {
    userCountry = JSON.parse(userCountryCookie.value) as Country;
  }

  return (
    <>
      <CartContainer userCountry={userCountry} />
    </>
  );
}
