import { privateRoute } from "@/lib/utils";
import React from "react";

async function SellerPage() {
  await privateRoute("SELLER");

  return <div>SellerPage</div>;
}

export default SellerPage;
