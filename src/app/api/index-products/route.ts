import { db } from "@/lib/db";
import client from "@/lib/elasticsearch";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Fetch products and their variants with images where order = 1 from the database using Prisma
    const products = await db.product.findMany({
      include: {
        variants: {
          include: { images: true },
        },
      },
    });

    // Prepare the body for bulk indexing in Elasticsearch
    const body = products.flatMap((product) =>
      product.variants.flatMap((variant) => {
        return [
          { index: { _index: "products", _id: variant.id } },
          {
            name: `${product.name} · ${variant.variantName}`,
            link: `/product/${product.slug}?variant=${variant.slug}`, // Link to product variant
            image: variant.images[0].url,
          },
        ];
      })
    );

    // Execute the bulk request to Elasticsearch
    const bulkResponse = await client.bulk({ refresh: true, body });

    // Check for any errors in the bulk response
    if (bulkResponse.errors) {
      return NextResponse.json(
        {
          message: "Failed to index products and variants",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Products indexed successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
