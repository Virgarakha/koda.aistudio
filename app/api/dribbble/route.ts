import { NextResponse } from "next/server";
import { searchDribbbleDesigns, categorizeTopic } from "@/lib/ai/dribbble";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "student portal dashboard ui";
    const count = parseInt(searchParams.get("count") || "3", 10);

    const designs = await searchDribbbleDesigns(query, count);
    const meta = categorizeTopic(query);

    return NextResponse.json({
      success: true,
      query,
      category: meta.category,
      designs,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error)?.message || "Failed to search Dribbble" },
      { status: 500 }
    );
  }
}
