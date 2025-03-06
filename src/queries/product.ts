"use server";
import { db } from "@/lib/db";
import {
  FreeShippingWithCountriesType,
  ProductPageType,
  ProductShippingDetailsType,
  ProductWithVariantType,
  RatingStatisticsType,
  SortOrder,
  VariantImageType,
  VariantSimplified,
} from "@/lib/types";
import { generateUniqueSlug } from "@/lib/utils";

import { currentUser } from "@clerk/nextjs/server";

import slugify from "slugify";
import { cookies } from "next/headers";
import { Store } from "@prisma/client";

export const upsertProduct = async (
  product: ProductWithVariantType,
  storeUrl: string
) => {
  try {
    // Retrieve current user
    const user = await currentUser();

    // Check if user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Ensure user has seller privileges
    if (user.privateMetadata.role !== "SELLER")
      throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry."
      );

    // Ensure product data is provided
    if (!product) throw new Error("Please provide product data.");

    // Find the store by URL
    const store = await db.store.findUnique({
      where: { url: storeUrl, userId: user.id },
    });
    if (!store) throw new Error("Store not found.");

    // Check if the product already exists
    const existingProduct = await db.product.findUnique({
      where: { id: product.productId },
    });

    // Check if the variant already exists
    const existingVariant = await db.productVariant.findUnique({
      where: { id: product.variantId },
    });

    console.log(product);

    if (existingProduct) {
      if (existingVariant) {
        // Create new variant
        await handleCreateVariant(product);
      } else {
        try {
          // Create new variant
          await handleCreateVariant(product);
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      // Create new product and variant
      await handleProductCreate(product, store.id);
    }
  } catch (error) {
    throw error;
  }
};

const handleProductCreate = async (
  product: ProductWithVariantType,
  storeId: string
) => {
  // Generate unique slugs for product and variant
  const productSlug = await generateUniqueSlug(
    slugify(product.name, {
      replacement: "-",
      lower: true,
      trim: true,
    }),
    "product"
  );

  const variantSlug = await generateUniqueSlug(
    slugify(product.variantName, {
      replacement: "-",
      lower: true,
      trim: true,
    }),
    "productVariant"
  );

  const productData = {
    id: product.productId,
    name: product.name,
    description: product.description,
    slug: productSlug,
    store: { connect: { id: storeId } },
    category: { connect: { id: product.categoryId } },
    subCategory: { connect: { id: product.subCategoryId } },
    brand: product.brand,
    specs: {
      create: product.product_specs.map((spec) => ({
        name: spec.name,
        value: spec.value,
      })),
    },
    questions: {
      create: product.questions.map((q) => ({
        question: q.question,
        answer: q.answer,
      })),
    },
    variants: {
      create: [
        {
          id: product.variantId,
          variantName: product.variantName,
          variantDescription: product.variantDescription,
          slug: variantSlug,
          sku: product.sku,
          weight: product.weight,
          keywords: product.keywords.join(","),
          isSale: product.isSale,
          saleEndDate: product.saleEndDate,
          variantImage: product.variantImage,
          images: {
            create: product.images.map((img) => ({
              url: img.url,
            })),
          },
          colors: {
            create: product.colors.map((color) => ({
              name: color.color,
            })),
          },
          sizes: {
            create: product.sizes.map((size) => ({
              size: size.size,
              price: size.price,
              quantity: size.quantity,
              discount: size.discount,
            })),
          },
          specs: {
            create: product.variant_specs.map((spec) => ({
              name: spec.name,
              value: spec.value,
            })),
          },
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      ],
    },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  const new_product = await db.product.create({ data: productData });
  return new_product;
};

const handleCreateVariant = async (product: ProductWithVariantType) => {
  const variantSlug = await generateUniqueSlug(
    slugify(product.variantName, {
      replacement: "-",
      lower: true,
      trim: true,
    }),
    "productVariant"
  );

  const variantData = {
    id: product.variantId,
    variantName: product.variantName,
    variantDescription: product.variantDescription,
    slug: variantSlug,
    isSale: product.isSale,
    saleEndDate: product.saleEndDate,
    keywords: product.keywords.join(","),
    sku: product.sku,
    weight: product.weight,
    productId: product.productId,
    variantImage: product.variantImage,
    images: {
      create: product.images.map((img) => ({
        url: img.url,
      })),
    },
    colors: {
      create: product.colors.map((color) => ({
        name: color.color,
      })),
    },
    sizes: {
      create: product.sizes.map((size) => ({
        size: size.size,
        price: size.price,
        quantity: size.quantity,
        discount: size.discount,
      })),
    },
    specs: {
      create: product.variant_specs.map((spec) => ({
        name: spec.name,
        value: spec.value,
      })),
    },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  const new_variant = await db.productVariant.create({ data: variantData });
  return new_variant;
};

export const getProductMainInfo = async (productId: string) => {
  // Retrieve the product from the database
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      questions: true,
      specs: true,
    },
  });
  if (!product) return null;

  // Return the main information of the product
  return {
    productId: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,
    storeId: product.storeId,
    questions: product.questions.map((q) => ({
      question: q.question,
      answer: q.answer,
    })),
    product_specs: product.specs.map((spec) => ({
      name: spec.name,
      value: spec.value,
    })),
  };
};

export const getProductVariant = async (
  productId: string,
  variantId: string
) => {
  // Retrieve product variant details from the database
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
      subCategory: true,
      variants: {
        where: {
          id: variantId,
        },
        include: {
          images: true,
          colors: {
            select: {
              name: true,
            },
          },
          sizes: {
            select: {
              size: true,
              quantity: true,
              price: true,
              discount: true,
            },
          },
        },
      },
    },
  });
  if (!product) return;
  return {
    productId: product?.id,
    variantId: product?.variants[0].id,
    name: product.name,
    description: product?.description,
    variantName: product.variants[0].variantName,
    variantDescription: product.variants[0].variantDescription,
    images: product.variants[0].images,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,
    isSale: product.variants[0].isSale,
    brand: product.brand,
    sku: product.variants[0].sku,
    colors: product.variants[0].colors,
    sizes: product.variants[0].sizes,
    keywords: product.variants[0].keywords.split(","),
  };
};

export const getAllStoreProducts = async (storeUrl: string) => {
  // Retrieve store details from the database using the store URL
  const store = await db.store.findUnique({ where: { url: storeUrl } });
  if (!store) throw new Error("Please provide a valid store URL.");

  // Retrieve all products associated with the store
  const products = await db.product.findMany({
    where: {
      storeId: store.id,
    },
    include: {
      category: true,
      subCategory: true,
      offerTag: true,
      variants: {
        include: {
          images: { orderBy: { createdAt: "asc" } },
          colors: true,
          sizes: true,
        },
      },
      store: {
        select: {
          id: true,
          url: true,
        },
      },
    },
  });

  return products;
};

export const deleteProduct = async (productId: string) => {
  // Get current user
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) throw new Error("Unauthenticated.");

  // Ensure user has seller privileges
  if (user.privateMetadata.role !== "SELLER")
    throw new Error(
      "Unauthorized Access: Seller Privileges Required for Entry."
    );

  // Ensure product data is provided
  if (!productId) throw new Error("Please provide product id.");

  // Delete product from the database
  const response = await db.product.delete({ where: { id: productId } });
  return response;
};

export const getProducts = async (
  filters: any = {},
  sortBy = "",
  page: number = 1,
  pageSize: number = 10
) => {
  const currentPage = page;
  const limit = pageSize;
  const skip = (currentPage - 1) * limit;

  const whereClause: any = {
    AND: [],
  };

  const products = await db.product.findMany({
    where: whereClause,
    take: limit,
    skip: skip,
    include: {
      variants: {
        include: {
          images: true,
          colors: true,
          sizes: true,
        },
      },
    },
  });

  const productWithFilteredVariants = products.map((product) => {
    // Filter the variants based on the filters
    const filteredVariants = product.variants;

    // Transform the filtered variants into the VariantSimplified structure
    const variants: VariantSimplified[] = filteredVariants.map((variant) => ({
      variantId: variant.id,
      variantSlug: variant.slug,
      variantName: variant.variantName,
      images: variant.images,
      sizes: variant.sizes,
    }));

    const variantImages: VariantImageType[] = filteredVariants.map(
      (variant) => ({
        url: `/product/${product.slug}/${variant.slug}`,
        image: variant.variantImage
          ? variant.variantImage
          : variant.images[0].url,
      })
    );

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      rating: product.rating,
      sales: product.sales,
      numReviews: product.numReviews,
      variants,
      variantImages,
    };
  });

  const totalCount = products.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    products: productWithFilteredVariants,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
  };
};

export const getProductPageData = async (
  productSlug: string,
  variantSlug: string
) => {
  const product = await retrieveProductDetails(productSlug, variantSlug);

  if (!product) return;

  const userCountry = getUserCountry();

  // calculate and retrieve shipping cost
  const shippingDetails = await getShippingDetails(
    product.shippingFeeMethod,
    userCountry,
    product.store,
    product.freeShipping
  );

  const retingStats = await getRatingStats(product.id);

  return formatProductResponse(product, shippingDetails, retingStats);
};

export const retrieveProductDetailsOptimized = async (productSlug: string) => {
  const product = await db.product.findUnique({
    where: {
      slug: productSlug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      rating: true,
      numReviews: true,
      description: true,
      specs: true,
      questions: true,
      categoryId: true,
      subCategoryId: true,
      store: true,
      shippingFeeMethod: true,
      _count: {
        select: { reviews: true },
      },
      freeShipping: {
        include: {
          eligibaleCountries: true,
        },
      },
      variants: {
        select: {
          id: true,
          variantName: true,
          variantImage: true,
          weight: true,
          slug: true,
          sku: true,
          isSale: true,
          saleEndDate: true,
          variantDescription: true,
          keywords: true,
          specs: true,
          sizes: true,
          images: {
            select: { url: true },
          },
          colors: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const userCountry = getUserCountry();

  return product;
};

export const getProductFilteredReviews = async (
  productId: string,
  filters: { rating?: number; hasImages?: boolean },
  sort: { orderBy: "latest" | "oldest" | "highest" } | undefined,
  page: number = 1,
  pageSize: number = 4
) => {
  const reviewFilter: any = {
    productId,
  };

  // Apply rating filter if provided
  if (filters.rating) {
    const rating = filters.rating;
    reviewFilter.rating = {
      in: [rating, rating + 0.5],
    };
  }

  // Apply image filter if provided
  if (filters.hasImages) {
    reviewFilter.images = {
      some: {},
    };
  }

  // Set sorting order using local SortOrder type
  const sortOption: { createdAt?: SortOrder; rating?: SortOrder } =
    sort && sort.orderBy === "latest"
      ? { createdAt: "desc" }
      : sort && sort.orderBy === "oldest"
      ? { createdAt: "asc" }
      : { rating: "desc" };

  // Calculate pagination parameters
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const statistics = await getRatingStats(productId);
  // Fetch reviews from the database
  const reviews = await db.review.findMany({
    where: reviewFilter,
    include: {
      user: true,
    },
    orderBy: sortOption,
    skip, // Skip records for pagination
    take, // Take records for pagination
  });

  return { reviews, statistics };
};

export const getRelatedProducts = async (
  productId: string,
  categoryId: string,
  subCategoryId: string
) => {
  const subCategoryProducts = await db.product.findMany({
    where: {
      subCategoryId: subCategoryId,
      categoryId: categoryId,
      id: {
        not: productId,
      },
    },
    include: {
      variants: {
        include: {
          sizes: true,
          images: true,
          colors: true,
        },
      },
    },
    take: 6,
  });

  let relatedProducts = subCategoryProducts;

  console.log(relatedProducts);

  if (relatedProducts.length < 6) {
    const remainCount = 6 - relatedProducts.length;
    const categoryProducts = await db.product.findMany({
      where: {
        categoryId,
        id: {
          notIn: [productId, ...relatedProducts.map((product) => product.id)],
        },
      },
      include: {
        variants: {
          include: {
            sizes: true,
            images: true,
            colors: true,
          },
        },
      },
      take: remainCount,
    });

    relatedProducts = [...relatedProducts, ...categoryProducts];
  }

  const productsWithFilteredVariants = relatedProducts.map((product) => {
    const filterdVariants = product.variants;

    const variants: VariantSimplified[] = filterdVariants.map((variant) => ({
      variantId: variant.id,
      variantSlug: variant.slug,
      variantName: variant.variantName,
      images: variant.images,
      sizes: variant.sizes,
    }));

    const variantImages: VariantImageType[] = filterdVariants.map(
      (variant) => ({
        url: `/product/${product.slug}/${variant.slug}`,
        image: variant.variantImage
          ? variant.variantImage
          : variant.images[0].url,
      })
    );

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      rating: product.rating,
      sales: product.sales,
      numReviews: product.numReviews,
      variants,
      variantImages,
    };
  });

  return productsWithFilteredVariants;
};

// Helpers

export const retrieveProductDetails = async (
  productSlug: string,
  variantSlug: string
) => {
  const product = await db.product.findUnique({
    where: {
      slug: productSlug,
    },
    include: {
      category: true,
      subCategory: true,
      offerTag: true,
      store: true,
      specs: true,
      questions: true,
      freeShipping: {
        include: {
          eligibaleCountries: true,
        },
      },
      variants: {
        where: {
          slug: variantSlug,
        },
        include: {
          images: true,
          colors: true,
          sizes: true,
          specs: true,
        },
      },
    },
  });

  if (!product) return null;

  const variant_images = await db.productVariant.findMany({
    where: { productId: product.id },
  });

  return product;
};

const formatProductResponse = async (
  product: ProductPageType,
  shippingDetails: ProductShippingDetailsType,
  ratingStats: RatingStatisticsType
) => {
  if (!product) return;

  const variant = product.variants[0];

  const { store, category, subCategory, offerTag, questions } = product;
  const { images, colors, sizes } = variant;

  return {
    productId: product.id,
    variantId: variant.id,
    productSlug: product.slug,
    variantSlug: variant.slug,
    name: product.name,
    description: product.description,
    variantName: variant.variantName,
    variantDescription: variant.variantDescription,
    images,
    variants: product.variants,
    category,
    subCategory,
    offerTag,
    isSale: variant.isSale,
    saleEndDate: variant.saleEndDate,
    brand: product.brand,
    sku: variant.sku,
    weight: variant.weight,
    variantImage: variant.variantImage,
    colors,
    sizes,
    store: {
      id: store.id,
      url: store.url,
      name: store.name,
      logo: store.logo,
      followersCount: 10,
      isUSerFollowingStore: true,
    },
    specs: {
      product: product.specs,
      variant: variant.specs,
    },
    questions,
    rating: product.rating,
    reviews: [],
    reviewStats: ratingStats,
    shippingDetails,
    relatedProducts: [],
  };
};

const getUserCountry = () => {
  const cookieStore = cookies();

  const userCountry = cookieStore.get("userCountry");
  const parsedCountry = userCountry ? JSON.parse(userCountry.value) : null;

  if (userCountry) {
    return parsedCountry;
  } else {
    return { name: "Egypt", code: "EG" };
  }
};

export const getShippingDetails = async (
  shippingFeeMethod: string,
  userCountry: { name: string; code: string; city: string },
  store: Store,
  freeShipping: FreeShippingWithCountriesType | null
) => {
  const country = await db.country.findUnique({
    where: {
      name: userCountry.name,
      code: userCountry.code,
    },
  });

  if (country) {
    const shippingRate = await db.shippingRate.findFirst({
      where: {
        countryId: country.id,
        storeId: store.id,
      },
    });

    const returnPolicy = shippingRate?.returnPolicy || store.returnPolicy;
    const shippingService =
      shippingRate?.shippingService || store.shippingService;
    const shippingFeePerItem =
      shippingRate?.shippingFeePerItem || store.shippingFeePerItem;
    const shippingFeeForAdditionalItem =
      shippingRate?.shippingFeeForAdditionalItem ||
      store.shippingFeeForAdditionalItem;
    const shippingFeePerKg =
      shippingRate?.shippingFeePerKg || store.shippingFeePerKg;
    const shippingFeeFixed =
      shippingRate?.shippingFeeFixed || store.shippingFeeFixed;
    const deliveryTimeMin =
      shippingRate?.deliveryTimeMin || store.deliveryTimeMin;
    const deliveryTimeMax =
      shippingRate?.deliveryTimeMax || store.deliveryTimeMax;

    let shippingDetails = {
      shippingFeeMethod,
      shippingService,
      shippingFee: 0,
      extraShippingFee: 0,
      deliveryTimeMin,
      deliveryTimeMax,
      returnPolicy,
      countryCode: userCountry.code,
      countryName: userCountry.name,
      city: userCountry.city,
      isFreeShipping: false,
    };

    // check for free shipping
    if (freeShipping) {
      const free_shipping_countries = freeShipping.eligibaleCountries;

      const check_free_shipping = free_shipping_countries.find(
        (item) => item.countryId === country.id
      );

      if (check_free_shipping) {
        shippingDetails.isFreeShipping = true;
      }
    }

    const { isFreeShipping } = shippingDetails;

    switch (shippingFeeMethod) {
      case "ITEM":
        shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeePerItem;
        shippingDetails.extraShippingFee = isFreeShipping
          ? 0
          : shippingFeeForAdditionalItem;
        break;

      case "WEIGHT":
        shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeePerKg;
        break;

      case "FIXED":
        shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeeFixed;
        break;

      default:
        break;
    }
    return shippingDetails;
  }

  return false;
};

export const getRatingStats = async (productId: string) => {
  const ratingStats = await db.review.groupBy({
    by: ["rating"],
    where: {
      productId,
    },
    _count: {
      rating: true,
    },
  });

  const totalReviews = ratingStats.reduce(
    (sum, stat) => sum + stat._count.rating,
    0
  );

  const ratingCounts = Array(5).fill(0);

  ratingStats.forEach((stat) => {
    let rating = Math.floor(stat.rating);

    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1] = stat._count.rating;
    }
  });

  return {
    ratingStats: ratingCounts.map((count, index) => ({
      rating: index + 1,
      numReviews: count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    })),
    totalReviews,
  };
};
