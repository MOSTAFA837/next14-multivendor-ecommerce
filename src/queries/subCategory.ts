"use server";
// Clerk
import { currentUser } from "@clerk/nextjs/server";
// DB
import { db } from "@/lib/db";
// Prisma model
import { Category, SubCategory } from "@prisma/client";

export const upsertSubCategory = async (subCategory: SubCategory) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    if (user.privateMetadata.role !== "ADMIN")
      throw new Error(
        "Unauthorized Access: Admin Privileges Required for Entry."
      );

    if (!subCategory) throw new Error("Please provide subCategory data.");

    const existingSubCategory = await db.subCategory.findFirst({
      where: {
        AND: [
          {
            OR: [{ name: subCategory.name }, { url: subCategory.url }],
          },
          {
            NOT: {
              id: subCategory.id,
            },
          },
        ],
      },
    });

    if (existingSubCategory) {
      let errorMessage = "";
      if (existingSubCategory.name === subCategory.name) {
        errorMessage = "A SubCategory with the same name already exists";
      } else if (existingSubCategory.url === subCategory.url) {
        errorMessage = "A SubCategory with the same URL already exists";
      }
      throw new Error(errorMessage);
    }

    const subCategoryDetails = await db.subCategory.upsert({
      where: {
        id: subCategory.id,
      },
      update: subCategory,
      create: subCategory,
    });
    return subCategoryDetails;
  } catch (error) {
    // Log and re-throw any errors
    console.log(error);
    throw error;
  }
};

export const getAllSubCategories = async () => {
  // Retrieve all subCategories from the database
  const subCategories = await db.subCategory.findMany({
    include: {
      category: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return subCategories;
};

export const getSubCategoriesForCategory = async (categoryId: string) => {
  const subCategories = await db.subCategory.findMany({
    where: {
      categoryId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return subCategories;
};

export const getSubCategory = async (subCategoryId: string) => {
  // Ensure subCategory ID is provided
  if (!subCategoryId) throw new Error("Please provide suCategory ID.");
  // Retrieve subCategory
  const subCategory = await db.subCategory.findUnique({
    where: {
      id: subCategoryId,
    },
  });
  return subCategory;
};

export const deleteSubCategory = async (subCategoryId: string) => {
  // Get current user
  const user = await currentUser();
  // Check if user is authenticated
  if (!user) throw new Error("Unauthenticated.");
  // Verify admin permission
  if (user.privateMetadata.role !== "ADMIN")
    throw new Error(
      "Unauthorized Access: Admin Privileges Required for Entry."
    );
  // Ensure subCategory ID is provided
  if (!subCategoryId) throw new Error("Please provide category ID.");
  // Delete subCategory from the database
  const response = await db.subCategory.delete({
    where: {
      id: subCategoryId,
    },
  });
  return response;
};
