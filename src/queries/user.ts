"use server";

import { db } from "@/lib/db";
import { CartProductType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import {
  getDeliveryDetailsForStoreByCountry,
  getShippingDetails,
} from "./product";
import { ShippingAddress } from "@prisma/client";

export const followStore = async (storeId: string): Promise<boolean> => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated");

    const store = await db.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) throw new Error("Store not found.");

    // Check if the user exists
    const userData = await db.user.findUnique({
      where: {
        id: user.id,
      },
    });
    if (!userData) throw new Error("User not found.");

    // Check if the user is already following the store
    const userFollowingStore = await db.user.findFirst({
      where: {
        id: user.id,
        following: {
          some: {
            id: storeId,
          },
        },
      },
    });

    if (userFollowingStore) {
      // Unfollow the store and return false
      await db.store.update({
        where: {
          id: storeId,
        },
        data: {
          followers: {
            disconnect: { id: userData.id },
          },
        },
      });
      return false;
    } else {
      // Follow the store and return true
      await db.store.update({
        where: {
          id: storeId,
        },
        data: {
          followers: {
            connect: {
              id: userData.id,
            },
          },
        },
      });
      return true;
    }
  } catch (error) {
    throw error;
  }
};

export const saveUserCart = async (
  cartProducts: CartProductType[]
): Promise<boolean> => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated.");

  const userId = user.id;

  console.log("cartProducts", cartProducts);

  const userCart = await db.cart.findFirst({ where: { userId } });

  if (userCart) {
    await db.cart.delete({
      where: {
        userId,
      },
    });
  }

  const validatedCartItems = await Promise.all(
    cartProducts.map(async (cartProduct) => {
      const { productId, variantId, sizeId, quantity } = cartProduct;

      const product = await db.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          store: true,
          freeShipping: {
            include: {
              eligibaleCountries: true,
            },
          },
          variants: {
            where: {
              id: variantId,
            },
            include: {
              sizes: {
                where: {
                  id: sizeId,
                },
              },
              images: true,
            },
          },
        },
      });

      if (
        !product ||
        product.variants.length === 0 ||
        product.variants[0].sizes.length === 0
      ) {
        throw new Error(
          `Invalid product, variant, or size combination for productId ${productId}, variantId ${variantId}, sizeId ${sizeId}`
        );
      }

      const variant = product.variants[0];
      const size = variant.sizes[0];

      const validQty = Math.min(quantity, size.quantity);

      const price = size.discount
        ? size.price - size.price * (size.discount / 100)
        : size.price;

      // const countryCookie = getCookie("userCountry", { cookies });
      // const parsedCookie = JSON.parse(countryCookie as string);
      // console.log("parsedCookie", parsedCookie);

      let details = {
        shippingFee: 0,
        extraShippingFee: 0,
        isFreeShipping: false,
      };

      // if (countryCookie) {
      //   const country = JSON.parse(countryCookie as string);
      //   console.log("country", country);
      //   const temp_details = await getShippingDetails(
      //     product.shippingFeeMethod,
      //     country,
      //     product.store,
      //     product.freeShipping
      //   );
      //   if (typeof temp_details !== "boolean") {
      //     details = temp_details;
      //   }
      // }

      const temp_details = await getShippingDetails(
        product.shippingFeeMethod,
        { name: "US", city: "", code: "US" },
        product.store,
        product.freeShipping
      );

      if (typeof temp_details !== "boolean") {
        details = temp_details;
      }

      let shippingFee = 0;
      const { shippingFeeMethod } = product;
      if (shippingFeeMethod === "ITEM") {
        shippingFee =
          quantity === 1
            ? details.shippingFee
            : details.shippingFee + details.extraShippingFee * (quantity - 1);
      } else if (shippingFeeMethod === "WIGHT") {
        shippingFee = details.shippingFee * variant.weight * quantity;
      } else if (shippingFeeMethod === "FIXED") {
        shippingFee = details.shippingFee;
      }

      const totalPrice = price * validQty + shippingFee;
      return {
        productId,
        variantId,
        productSlug: product.slug,
        variantSlug: variant.slug,
        sizeId,
        storeId: product.storeId,
        sku: variant.sku,
        name: `${product.name} · ${variant.variantName}`,
        image: variant.images[0].url,
        size: size.size,
        quantity: validQty,
        price,
        shippingFee,
        totalPrice,
      };
    })
  );

  // Recalculate the cart's total price and shipping fees
  const subTotal = validatedCartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const shippingFees = validatedCartItems.reduce(
    (acc, item) => acc + item.shippingFee,
    0
  );

  const total = subTotal + shippingFees;

  // Save the validated items to the cart in the database
  const cart = await db.cart.create({
    data: {
      items: {
        create: validatedCartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          sizeId: item.sizeId,
          storeId: item.storeId,
          sku: item.sku,
          productSlug: item.productSlug,
          variantSlug: item.variantSlug,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
          shippingFee: item.shippingFee,
          totalPrice: item.totalPrice,
        })),
      },
      shippingFees,
      subTotal,
      total,
      userId,
    },
  });

  if (cart) return true;
  return false;
};

export const getUserShippingAddresses = async () => {
  try {
    // Get current user
    const user = await currentUser();

    // Ensure user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Retrieve all shipping addresses for the specified user
    const shippingAddresses = await db.shippingAddress.findMany({
      where: {
        userId: user.id,
      },
      include: {
        country: true,
        user: true,
      },
    });

    return shippingAddresses;
  } catch (error) {
    // Log and re-throw any errors
    throw error;
  }
};

export const upsertShippingAddress = async (address: ShippingAddress) => {
  try {
    // Get current user
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    // Ensure address data is provided
    if (!address) throw new Error("Please provide address data.");

    // Handle making the rest of addresses default false when we are adding a new default
    if (address.default) {
      const addressDB = await db.shippingAddress.findUnique({
        where: { id: address.id },
      });
      if (addressDB) {
        try {
          await db.shippingAddress.updateMany({
            where: {
              userId: user.id,
              default: true,
            },
            data: {
              default: false,
            },
          });
        } catch (error) {
          throw new Error("Could not reset default shipping addresses");
        }
      }
    }

    // Upsert shipping address into the database
    const upsertedAddress = await db.shippingAddress.upsert({
      where: {
        id: address.id,
      },
      update: {
        ...address,
        userId: user.id,
      },
      create: {
        ...address,
        userId: user.id,
      },
    });

    return upsertedAddress;
  } catch (error) {
    throw error;
  }
};

export const placeOrder = async (
  shippingAddress: ShippingAddress,
  cartId: string
): Promise<{ orderId: string }> => {
  // Ensure the user is authenticated
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated.");

  const userId = user.id;

  // Fetch user's cart with all items
  const cart = await db.cart.findUnique({
    where: {
      id: cartId,
    },
    include: {
      items: true,
    },
  });

  if (!cart) throw new Error("Cart not found.");

  const cartItems = cart.items;

  // Fetch product, variant, and size data from the database for validation
  const validatedCartItems = await Promise.all(
    cartItems.map(async (cartProduct) => {
      const { productId, variantId, sizeId, quantity } = cartProduct;

      const product = await db.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          store: true,
          freeShipping: {
            include: {
              eligibaleCountries: true,
            },
          },
          variants: {
            where: {
              id: variantId,
            },
            include: {
              sizes: {
                where: {
                  id: sizeId,
                },
              },
              images: true,
            },
          },
        },
      });

      if (
        !product ||
        product.variants.length === 0 ||
        product.variants[0].sizes.length === 0
      ) {
        throw new Error(
          `Invalid product, variant, or size combination for productId ${productId}, variantId ${variantId}, sizeId ${sizeId}`
        );
      }

      const variant = product.variants[0];
      const size = variant.sizes[0];

      const validQty = Math.min(quantity, size.quantity);

      const price = size.discount
        ? size.price - size.price * (size.discount / 100)
        : size.price;

      // const countryCookie = getCookie("userCountry", { cookies });
      // const parsedCookie = JSON.parse(countryCookie as string);
      // console.log("parsedCookie", parsedCookie);

      let details = {
        shippingFee: 0,
        extraShippingFee: 0,
        isFreeShipping: false,
      };

      // if (countryCookie) {
      //   const country = JSON.parse(countryCookie as string);
      //   console.log("country", country);
      //   const temp_details = await getShippingDetails(
      //     product.shippingFeeMethod,
      //     country,
      //     product.store,
      //     product.freeShipping
      //   );
      //   if (typeof temp_details !== "boolean") {
      //     details = temp_details;
      //   }
      // }

      const temp_details = await getShippingDetails(
        product.shippingFeeMethod,
        { name: "US", city: "", code: "US" },
        product.store,
        product.freeShipping
      );

      if (typeof temp_details !== "boolean") {
        details = temp_details;
      }

      let shippingFee = 0;
      const { shippingFeeMethod } = product;
      if (shippingFeeMethod === "ITEM") {
        shippingFee =
          quantity === 1
            ? details.shippingFee
            : details.shippingFee + details.extraShippingFee * (quantity - 1);
      } else if (shippingFeeMethod === "WIGHT") {
        shippingFee = details.shippingFee * variant.weight * quantity;
      } else if (shippingFeeMethod === "FIXED") {
        shippingFee = details.shippingFee;
      }

      const totalPrice = price * validQty + shippingFee;
      return {
        productId,
        variantId,
        productSlug: product.slug,
        variantSlug: variant.slug,
        sizeId,
        storeId: product.storeId,
        sku: variant.sku,
        name: `${product.name} · ${variant.variantName}`,
        image: variant.images[0].url,
        size: size.size,
        quantity: validQty,
        price,
        shippingFee,
        totalPrice,
      };
    })
  );

  // Define the type for grouped items by store
  type GroupItems = { [storeId: string]: typeof validatedCartItems };

  // Group validated items by store
  const groupedItems = validatedCartItems.reduce<GroupItems>((acc, item) => {
    if (!acc[item.storeId]) acc[item.storeId] = [];

    acc[item.storeId].push(item);
    return acc;
  }, {} as GroupItems);

  console.log("groupedItems", groupedItems);

  // Create the order
  const order = await db.order.create({
    data: {
      userId: userId,
      shippingAddressId: shippingAddress.id,
      orderStatus: "Pending",
      paymentStatus: "Pending",
      subTotal: 0, // Will calculate below
      shippingFees: 0, // Will calculate below
      total: 0, // Will calculate below
    },
  });

  // Iterate over each store's items and create OrderGroup and OrderItems
  let orderTotalPrice = 0;
  let orderShippingFee = 0;

  for (const [storeId, items] of Object.entries(groupedItems)) {
    // Calculate store-specific totals
    const groupedTotalPrice = items.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    const groupShippingFees = items.reduce(
      (acc, item) => acc + item.shippingFee,
      0
    );

    const { shippingService, deliveryTimeMin, deliveryTimeMax } =
      await getDeliveryDetailsForStoreByCountry(
        storeId,
        shippingAddress.countryId
      );

    // Create an OrderGroup for this store
    const orderGroup = await db.orderGroup.create({
      data: {
        orderId: order.id,
        storeId: storeId,
        status: "Pending",
        subTotal: groupedTotalPrice - groupShippingFees,
        shippingFees: groupShippingFees,
        total: groupedTotalPrice,
        shippingService: shippingService || "International Delivery",
        shippingDeliveryMin: deliveryTimeMin || 7,
        shippingDeliveryMax: deliveryTimeMax || 30,
      },
    });

    // Create OrderItems for this OrderGroup
    for (const item of items) {
      await db.orderItem.create({
        data: {
          orderGroupId: orderGroup.id,
          productId: item.productId,
          variantId: item.variantId,
          sizeId: item.sizeId,
          productSlug: item.productSlug,
          variantSlug: item.variantSlug,
          sku: item.sku,
          name: item.name,
          image: item.image,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          shippingFee: item.shippingFee,
          totalPrice: item.totalPrice,
        },
      });
    }

    // Update order totals
    orderTotalPrice += groupedTotalPrice;
    orderShippingFee += groupShippingFees;
  }

  // Update the main order with the final totals
  await db.order.update({
    where: {
      id: order.id,
    },
    data: {
      subTotal: orderTotalPrice - orderShippingFee,
      shippingFees: orderShippingFee,
      total: orderTotalPrice,
    },
  });

  // Delete cart

  // await db.cart.delete({
  //   where: {
  //     id: cartId,
  //   },
  // });

  return {
    orderId: order.id,
  };
};

export const emptyUserCart = async () => {
  try {
    // Ensure the user is authenticated
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    const userId = user.id;

    const res = await db.cart.delete({
      where: {
        userId,
      },
    });
    if (res) return true;
  } catch (error) {
    throw error;
  }
};

export const updateCartWithLatest = async (
  cartProducts: CartProductType[]
): Promise<CartProductType[]> => {
  // Fetch product, variant, and size data from the database for validation
  const validatedCartItems = await Promise.all(
    cartProducts.map(async (cartProduct) => {
      const { productId, variantId, sizeId, quantity } = cartProduct;

      // Fetch the product, variant, and size from the database
      const product = await db.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          store: true,
          freeShipping: {
            include: {
              eligibaleCountries: true,
            },
          },
          variants: {
            where: {
              id: variantId,
            },
            include: {
              sizes: {
                where: {
                  id: sizeId,
                },
              },
              images: true,
            },
          },
        },
      });

      if (
        !product ||
        product.variants.length === 0 ||
        product.variants[0].sizes.length === 0
      ) {
        throw new Error(
          `Invalid product, variant, or size combination for productId ${productId}, variantId ${variantId}, sizeId ${sizeId}`
        );
      }

      const variant = product.variants[0];
      const size = variant.sizes[0];

      // Calculate Shipping details
      const countryCookieRaw = await getCookie("userCountry", { cookies });
      const countryCookie =
        typeof countryCookieRaw === "string" ? countryCookieRaw : undefined;

      let details = {
        shippingService: product.store.shippingService,
        shippingFee: 0,
        extraShippingFee: 0,
        isFreeShipping: false,
        deliveryTimeMin: 0,
        deliveryTimeMax: 0,
      };

      if (countryCookie) {
        const country = JSON.parse(countryCookie);
        const temp_details = await getShippingDetails(
          product.shippingFeeMethod,
          country,
          product.store,
          product.freeShipping
        );

        if (typeof temp_details !== "boolean") {
          details = temp_details;
        }
      }

      const price = size.discount
        ? size.price - (size.price * size.discount) / 100
        : size.price;

      const validated_qty = Math.min(quantity, size.quantity);

      return {
        productId,
        variantId,
        productSlug: product.slug,
        variantSlug: variant.slug,
        sizeId,
        sku: variant.sku,
        name: product.name,
        variantName: variant.variantName,
        image: variant.images[0].url,
        variantImage: variant.variantImage,
        stock: size.quantity,
        weight: variant.weight,
        shippingMethod: product.shippingFeeMethod,
        size: size.size,
        quantity: validated_qty,
        price,
        shippingService: details.shippingService,
        shippingFee: details.shippingFee,
        extraShippingFee: details.extraShippingFee,
        deliveryTimeMin: details.deliveryTimeMin,
        deliveryTimeMax: details.deliveryTimeMax,
        isFreeShipping: details.isFreeShipping,
      };
    })
  );
  return validatedCartItems;
};
