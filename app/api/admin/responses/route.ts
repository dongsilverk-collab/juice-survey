import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  const { data, error, count } = await supabase
    .from("survey_responses")
    .select("*", { count: "exact" })
    .order("submitted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Responses fetch error:", error);
    return NextResponse.json({ error: "데이터 조회 실패" }, { status: 500 });
  }

  return NextResponse.json({
    responses: data,
    total: count,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}
