import client from "@/lib/elasticsearch";
import { NextResponse } from "next/server";

interface Product {
  name: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("search");

  if (!q || typeof q !== "string") {
    return new NextResponse("Invalid search query", { status: 400 });
  }

  try {
    // Query Elasticsearch with improved types
    const response = await client.search<{ _source: Product }>({
      index: "products",
      query: {
        match_phrase_prefix: {
          name: q,
        },
      },
    });

    const results = response.hits.hits.map((hit) => hit._source);

    return NextResponse.json(results);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
