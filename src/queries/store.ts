"use server";

import { checkUserRole } from "@/lib/checkUserRole";
// DB
import { db } from "@/lib/db";
import { StoreShippingType } from "@/lib/types";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Prisma models
import { ShippingRate, Store, StoreStatus } from "@prisma/client";

export const upsertStore = async (store: Partial<Store>) => {
  try {
    // Get current user
    const user = await currentUser();

    // Ensure user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Verify seller permission
    if (user.privateMetadata.role !== "SELLER")
      throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry."
      );

    // Ensure store data is provided
    if (!store) throw new Error("Please provide store data.");

    // Check if store with same name, email,url, or phone number already exists
    const existingStore = await db.store.findFirst({
      where: {
        AND: [
          {
            OR: [
              { name: store.name },
              { email: store.email },
              { phone: store.phone },
              { url: store.url },
            ],
          },
          {
            NOT: {
              id: store.id,
            },
          },
        ],
      },
    });

    // If a store with same name, email, or phone number already exists, throw an error
    if (existingStore) {
      let errorMessage = "";
      if (existingStore.name === store.name) {
        errorMessage = "A store with the same name already exists";
      } else if (existingStore.email === store.email) {
        errorMessage = "A store with the same email already exists";
      } else if (existingStore.phone === store.phone) {
        errorMessage = "A store with the same phone number already exists";
      } else if (existingStore.url === store.url) {
        errorMessage = "A store with the same URL already exists";
      }
      throw new Error(errorMessage);
    }

    // Upsert store details into the database

    const storeDetails = await db.store.upsert({
      where: {
        id: store.id,
      },
      update: store,
      // @ts-ignore
      create: {
        ...store,
        user: {
          connect: { id: user.id },
        },
      },
    });

    return storeDetails;
  } catch (error) {
    throw error;
  }
};

export const getStoreShippingDetails = async (storeUrl: string) => {
  try {
    if (!storeUrl) throw new Error("Please provide store URL");

    const store = await db.store.findUnique({
      where: { url: storeUrl },
      select: {
        shippingFeeFixed: true,
        shippingFeeForAdditionalItem: true,
        shippingFeePerItem: true,
        shippingFeePerKg: true,
        shippingService: true,
        returnPolicy: true,
        deliveryTimeMax: true,
        deliveryTimeMin: true,
      },
    });

    if (!store) throw new Error("Store not found.");

    return store;
  } catch (error: any) {
    throw error;
  }
};

export const updateStoreShippingDetails = async (
  storeUrl: string,
  shippingDetails: StoreShippingType
) => {
  try {
    const user = await currentUser();

    if (!user) throw new Error("Unauthenticated.");

    if (user.privateMetadata.role !== "SELLER")
      throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry."
      );

    if (!storeUrl || !shippingDetails)
      throw new Error("Please provide store URL and shipping details.");

    const isOwnership = await db.store.findUnique({
      where: { url: storeUrl, userId: user.id },
    });

    if (!isOwnership) {
      throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry."
      );
    }

    const updatedStore = await db.store.update({
      where: { url: storeUrl, userId: user.id },
      data: shippingDetails,
    });

    return updatedStore;
  } catch (error: any) {
    throw error;
  }
};

export const getStoreShippingRates = async (storeUrl: string) => {
  try {
    const user = await checkUserRole("SELLER");

    if (!storeUrl) throw new Error("Store URL is required.");

    const store = await db.store.findUnique({
      where: { url: storeUrl, userId: user.id },
    });

    if (!store) throw new Error("Store not found.");

    const countries = await db.country.findMany({
      orderBy: {
        name: "asc",
      },
    });

    const shippingRates = await db.shippingRate.findMany({
      where: {
        storeId: store.id,
      },
    });

    const rateMap = new Map();
    shippingRates.forEach((rate) => {
      rateMap.set(rate.countryId, rate);
    });

    const result = countries.map((country) => ({
      countryId: country.id,
      countryName: country.name,
      shippingRate: rateMap.get(country.id) || null,
    }));

    return result;
  } catch (error) {
    throw error;
  }
};

export const upsertShippingRate = async (
  storeUrl: string,
  shippingRate: ShippingRate
) => {
  try {
    const user = await checkUserRole("SELLER");

    const store = await db.store.findUnique({
      where: { url: storeUrl, userId: user.id },
    });

    if (!store || !shippingRate)
      throw new Error("Please Check for missing data or store.");

    const newShippingRate = await db.shippingRate.upsert({
      where: { id: shippingRate.id },
      update: { ...shippingRate, storeId: store.id },
      create: { ...shippingRate, storeId: store.id },
    });

    return newShippingRate;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getStoreFollowingInfo = async (storeId: string) => {
  const user = await currentUser();
  let isUserFollowingStore = false;

  if (user) {
    const storeFollowers = await db.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        followers: {
          where: {
            id: user.id,
          },
          select: { id: true },
        },
      },
    });

    if (storeFollowers && storeFollowers.followers.length > 0) {
      isUserFollowingStore = true;
    }
  }

  const storeFollowersInfo = await db.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      _count: {
        select: {
          followers: true,
        },
      },
    },
  });
  return {
    isUserFollowingStore,
    followersCount: storeFollowersInfo
      ? storeFollowersInfo._count.followers
      : 0,
  };
};
