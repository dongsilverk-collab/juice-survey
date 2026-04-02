"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { surveyConfig } from "@/config/survey-config";
import type { SurveyStats } from "@/lib/types/survey";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, Star, TrendingUp, ClipboardList, Loader2 } from "lucide-react";

const COLORS = ["#22c55e", "#3b82f6", "#eab308", "#f97316", "#ef4444"];

const PURCHASE_LABELS: Record<string, string> = {
  definitely: "반드시 구매",
  probably: "아마 구매",
  maybe: "잘 모르겠다",
  probably_not: "아마 안 함",
  definitely_not: "절대 안 함",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => alert("데이터 로드 실패"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!stats) return null;

  const overallSatisfaction = stats.averageRatings["overall_satisfaction"] ?? 0;

  // 별점 분포 차트 데이터 (전반적 만족도)
  const satisfactionDist = stats.ratingDistribution["overall_satisfaction"] ?? {};
  const distData = [1, 2, 3, 4, 5].map((star) => ({
    name: `${star}점`,
    count: satisfactionDist[star] ?? 0,
  }));

  // 구매 의향 파이 차트
  const purchaseData = Object.entries(stats.purchaseIntentBreakdown).map(
    ([key, count]) => ({
      name: PURCHASE_LABELS[key] ?? key,
      value: count,
    })
  );

  return (
    <main className="flex-1 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">설문 관리 대시보드</h1>
            <p className="text-muted-foreground">건강주스 시음 평가 결과</p>
          </div>
          <Link href="/admin/responses">
            <Button variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              전체 응답 보기
            </Button>
          </Link>
        </div>

        {/* 핵심 지표 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">총 응답수</p>
                  <p className="text-2xl font-bold">{stats.totalResponses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">평균 만족도</p>
                  <p className="text-2xl font-bold">
                    {overallSatisfaction}
                    <span className="text-sm font-normal text-muted-foreground">
                      /5
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NPS 점수</p>
                  <p className="text-2xl font-bold">
                    {stats.npsScore}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {stats.npsScore >= 50 ? (
                        <Badge variant="default" className="bg-green-500">좋음</Badge>
                      ) : stats.npsScore >= 0 ? (
                        <Badge variant="secondary">보통</Badge>
                      ) : (
                        <Badge variant="destructive">개선 필요</Badge>
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">평균 맛 평점</p>
                  <p className="text-2xl font-bold">
                    {stats.averageRatings["taste_overall"] ?? "-"}
                    <span className="text-sm font-normal text-muted-foreground">
                      /5
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">만족도 분포</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.totalResponses > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={distData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  아직 응답이 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">구매 의향</CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={purchaseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      dataKey="value"
                    >
                      {purchaseData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  아직 응답이 없습니다
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 항목별 평균 평점 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">항목별 평균 평점</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {surveyConfig.questions
                .filter((q) => q.type === "rating" || q.type === "scale")
                .map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <span className="text-sm">{q.question}</span>
                    <span className="font-bold ml-2 whitespace-nowrap">
                      {stats.averageRatings[q.id] ?? "-"}
                      <span className="text-xs text-muted-foreground">
                        /{q.max ?? 5}
                      </span>
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
