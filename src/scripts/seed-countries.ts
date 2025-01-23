"use server";

import countries from "@/data/countries.json";
import { db } from "@/lib/db";
export async function seedCountries() {
  try {
    for (const country of countries) {
      await db.country.create({
        data: {
          name: country.name,
          code: country.code,
        },
      });
    }
    console.log("Countries seeded successfully");
  } catch (error) {
    console.log("Error seeding countries", error);
  }
}
