import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("survey_responses")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // 전체 삭제

  if (error) {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
