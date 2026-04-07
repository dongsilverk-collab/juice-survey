import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { surveyConfig } from "@/config/survey-config";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: responses, error } = await supabase
    .from("survey_responses")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json({ error: "데이터 조회 실패" }, { status: 500 });
  }

  const totalResponses = responses.length;

  // 별점/척도 질문의 평균 계산
  const ratingQuestions = surveyConfig.questions.filter(
    (q) => q.type === "rating" || q.type === "scale"
  );

  const averageRatings: Record<string, number> = {};
  const ratingDistribution: Record<string, Record<number, number>> = {};

  for (const q of ratingQuestions) {
    const values = responses
      .map((r) => {
        const val = r.answers?.[q.id];
        return typeof val === "number" ? val : null;
      })
      .filter((v): v is number => v !== null);

    if (values.length > 0) {
      averageRatings[q.id] = Number(
        (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
      );

      const dist: Record<number, number> = {};
      for (const v of values) {
        dist[v] = (dist[v] || 0) + 1;
      }
      ratingDistribution[q.id] = dist;
    }
  }

  // 제품별 응답 수 (purchaseIntentBreakdown 필드 재활용)
  const purchaseIntentBreakdown: Record<string, number> = {};
  for (const r of responses) {
    const product = r.answers?.product as string | undefined;
    if (product) {
      purchaseIntentBreakdown[product] = (purchaseIntentBreakdown[product] || 0) + 1;
    }
  }

  const npsScore = 0;

  return NextResponse.json({
    totalResponses,
    averageRatings,
    ratingDistribution,
    purchaseIntentBreakdown,
    npsScore,
    recentResponses: responses.slice(0, 20),
  });
}
