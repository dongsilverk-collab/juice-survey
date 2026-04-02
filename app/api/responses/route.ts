import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { survey_id, respondent_name, respondent_age_group, respondent_gender, answers } = body;

    if (!survey_id || !answers) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.from("survey_responses").insert({
      survey_id,
      respondent_name: respondent_name || null,
      respondent_age_group: respondent_age_group || null,
      respondent_gender: respondent_gender || null,
      answers,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "저장 실패" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
