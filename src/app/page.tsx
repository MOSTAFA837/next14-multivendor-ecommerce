import { updateVariantImage } from "@/scripts/variantImage";

export default async function Home() {
  await updateVariantImage();
  return <div></div>;
}
