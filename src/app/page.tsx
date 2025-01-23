import { seedCountries } from "@/scripts/seed-countries";

export default async function Home() {
  await seedCountries();
  return <div>Div</div>;
}
