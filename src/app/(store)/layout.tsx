import { ReactNode } from "react";

import Header from "@/components/store/layout/header";
import CategoriesHeader from "@/components/store/layout/categories-header";
import Footer from "@/components/store/layout/footer";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Header />
      <CategoriesHeader />

      <div>{children}</div>

      <Footer />
    </div>
  );
}
