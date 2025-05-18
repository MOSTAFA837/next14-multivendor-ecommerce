import UserMenu from "./user-menu";
import Cart from "./cart";
import Search from "./search.tsx";

export default function Header() {
  // const cookieStore = cookies();
  // const userCountryCookie = cookieStore.get("userCountry");

  // let userCountry: Country = {
  //   name: "United States",
  //   city: "",
  //   code: "US",
  //   region: "",
  // };

  // if (userCountryCookie) {
  //   userCountry = JSON.parse(userCountryCookie.value) as Country;
  // }

  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200">
      <div className="h-full w-full lg:flex px-4 lg:px-12">
        <div className="flex lg:w-full lg:flex-1 flex-col lg:flex-row gap-3 py-3">
          <div className="flex items-center justify-between">
            <a href="/">
              <h1 className="font-extrabold text-3xl font-mono">GoShop</h1>
            </a>
            <div className="flex lg:hidden">
              <Cart />
              <UserMenu />
            </div>
          </div>

          <Search />
        </div>

        <div className="hidden lg:flex w-full lg:w-fit lg:mt-2 justify-end mt-1.5 pl-6">
          {/* <CountryLanguageCurrencySelector userCountry={userCountry} /> */}
          <UserMenu />
          <Cart />
        </div>
      </div>
    </div>
  );
}
