"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { surveyConfig, PRODUCT_LABELS, PRODUCTS } from "@/config/survey-config";
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
import { Users, Star, ClipboardList, Loader2, Trash2 } from "lucide-react";

const COLORS = ["#22c55e", "#3b82f6", "#eab308", "#f97316", "#ef4444"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!confirm("모든 응답을 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;
    setResetting(true);
    try {
      await fetch("/api/admin/reset", { method: "DELETE" });
      setStats((prev) => prev ? { ...prev, totalResponses: 0, averageRatings: {}, ratingDistribution: {}, purchaseIntentBreakdown: {}, npsScore: 0, recentResponses: [] } : prev);
    } catch {
      alert("삭제 실패");
    } finally {
      setResetting(false);
    }
  };

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

  const overallSatisfaction = stats.averageRatings?.["overall_satisfaction"] ?? 0;

  // 만족도 분포 차트
  const satisfactionDist = stats.ratingDistribution?.["overall_satisfaction"] ?? {};
  const distData = [1, 2, 3, 4, 5].map((star) => ({
    name: `${star}점`,
    count: satisfactionDist[star] ?? 0,
  }));

  // 제품별 응답 수 파이 차트
  const productData = Object.entries(stats.purchaseIntentBreakdown ?? {}).map(
    ([key, count]) => ({
      name: PRODUCT_LABELS[key] ?? key,
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
          <div className="flex gap-2">
            <Link href="/admin/responses">
              <Button variant="outline">
                <ClipboardList className="mr-2 h-4 w-4" />
                전체 응답 보기
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleReset} disabled={resetting}>
              {resetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              응답 초기화
            </Button>
          </div>
        </div>

        {/* 핵심 지표 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <span className="text-sm font-normal text-muted-foreground">/5</span>
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
                    {stats.averageRatings?.["taste_overall"] ?? "-"}
                    <span className="text-sm font-normal text-muted-foreground">/5</span>
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
              <CardTitle className="text-lg">전반적 만족도 분포</CardTitle>
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
              <CardTitle className="text-lg">제품별 응답 수</CardTitle>
            </CardHeader>
            <CardContent>
              {productData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      dataKey="value"
                    >
                      {productData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

        {/* 제품별 평점 비교 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">제품별 평점 비교</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalResponses > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground min-w-[120px]">항목</th>
                      {PRODUCTS.map((p) => (
                        <th key={p.id} className="text-center py-2 px-2 font-medium min-w-[100px]">
                          {p.label.replace("주스", "").replace("ABC", "ABC\n")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {surveyConfig.questions
                      .filter((q) => q.type === "scale")
                      .map((q) => (
                        <tr key={q.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-2 pr-4 text-muted-foreground">{q.question}</td>
                          {PRODUCTS.map((p) => {
                            const val = stats.productStats?.[p.id]?.[q.id];
                            const score = val ?? null;
                            const bg =
                              score === null ? "" :
                              score >= 4.5 ? "text-green-600 font-bold" :
                              score >= 3.5 ? "text-blue-600 font-semibold" :
                              score >= 2.5 ? "text-yellow-600" :
                              "text-red-500";
                            return (
                              <td key={p.id} className={`text-center py-2 px-2 ${bg}`}>
                                {score !== null ? `${score}` : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    {/* 평균 행 */}
                    <tr className="bg-muted/40 font-semibold">
                      <td className="py-2 pr-4">전체 평균</td>
                      {PRODUCTS.map((p) => {
                        const vals = Object.values(stats.productStats?.[p.id] ?? {});
                        const avg = vals.length > 0
                          ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
                          : "-";
                        return (
                          <td key={p.id} className="text-center py-2 px-2">{avg}</td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">아직 응답이 없습니다</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
