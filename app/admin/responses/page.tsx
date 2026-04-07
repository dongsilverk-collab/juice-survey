"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SurveyResponse } from "@/lib/types/survey";
import { PRODUCTS, PRODUCT_LABELS } from "@/config/survey-config";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

// 같은 사람의 응답을 하나로 묶기 (1분 이내 + 동일 이름/연령/성별)
function groupByRespondent(responses: SurveyResponse[]) {
  const groups: SurveyResponse[][] = [];
  const used = new Set<string>();

  const sorted = [...responses].sort(
    (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
  );

  for (const r of sorted) {
    if (used.has(r.id)) continue;
    const t = new Date(r.submitted_at).getTime();
    const group = sorted.filter((s) => {
      if (used.has(s.id)) return false;
      const diff = Math.abs(new Date(s.submitted_at).getTime() - t);
      return (
        diff <= 60000 &&
        s.respondent_name === r.respondent_name &&
        s.respondent_age_group === r.respondent_age_group &&
        s.respondent_gender === r.respondent_gender
      );
    });
    group.forEach((s) => used.add(s.id));
    groups.push(group);
  }

  return groups.reverse(); // 최신순
}

export default function ResponsesPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/admin/responses?page=1&limit=500`)
      .then((res) => {
        if (res.status === 401) { router.push("/admin/login"); return null; }
        return res.json();
      })
      .then((data) => { if (data) setResponses(data.responses); })
      .catch(() => alert("데이터 로드 실패"))
      .finally(() => setLoading(false));
  }, [router]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("ko-KR", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const scoreColor = (val: number | null) => {
    if (val === null) return "text-muted-foreground";
    if (val >= 4) return "text-green-600 font-bold";
    if (val >= 3) return "text-blue-600";
    return "text-red-500";
  };

  const groups = groupByRespondent(responses);

  return (
    <main className="flex-1 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">응답 목록</h1>
            <p className="text-muted-foreground">총 {groups.length}명의 응답</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">응답자별 제품 만족도</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : groups.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">아직 응답이 없습니다</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-3 font-medium text-muted-foreground">#</th>
                      <th className="text-left py-2 pr-3 font-medium text-muted-foreground">이름</th>
                      <th className="text-left py-2 pr-3 font-medium text-muted-foreground">연령대</th>
                      {PRODUCTS.map((p) => (
                        <th key={p.id} className="text-center py-2 px-2 font-medium min-w-[90px] text-xs leading-tight">
                          {p.label}
                        </th>
                      ))}
                      <th className="text-left py-2 pl-3 font-medium text-muted-foreground">제출일시</th>
                      <th className="w-[60px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group, idx) => {
                      const first = group[0];
                      const productMap = Object.fromEntries(
                        group.map((r) => [r.answers?.product as string, r])
                      );
                      const isExpanded = expandedIdx === idx;

                      return (
                        <>
                          <tr
                            key={idx}
                            className="border-b hover:bg-muted/40 cursor-pointer"
                            onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                          >
                            <td className="py-3 pr-3 text-muted-foreground">{groups.length - idx}</td>
                            <td className="py-3 pr-3 font-medium">{first.respondent_name || "-"}</td>
                            <td className="py-3 pr-3 text-muted-foreground">{first.respondent_age_group || "-"}</td>
                            {PRODUCTS.map((p) => {
                              const r = productMap[p.id];
                              const val = r?.answers?.overall_satisfaction != null
                                ? Number(r.answers.overall_satisfaction)
                                : null;
                              return (
                                <td key={p.id} className={`text-center py-3 px-2 ${scoreColor(val)}`}>
                                  {val !== null ? `${val}/5` : "-"}
                                </td>
                              );
                            })}
                            <td className="py-3 pl-3 text-muted-foreground text-xs">{formatDate(first.submitted_at)}</td>
                            <td className="py-3 text-center">
                              {isExpanded
                                ? <ChevronUp className="h-4 w-4 mx-auto text-muted-foreground" />
                                : <ChevronDown className="h-4 w-4 mx-auto text-muted-foreground" />}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr key={`${idx}-detail`}>
                              <td colSpan={5 + PRODUCTS.length + 2} className="bg-muted/20 p-0">
                                <div className="p-4 space-y-4">
                                  {PRODUCTS.map((p) => {
                                    const r = productMap[p.id];
                                    if (!r) return null;
                                    return (
                                      <div key={p.id}>
                                        <p className="font-semibold text-sm mb-2">{p.label}</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                                          {Object.entries(r.answers)
                                            .filter(([key]) => key !== "product")
                                            .map(([key, val]) => (
                                              <div key={key} className="flex gap-1">
                                                <span className="text-muted-foreground">{key}:</span>
                                                <span className="font-medium">
                                                  {Array.isArray(val) ? val.join(", ") : String(val)}
                                                </span>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
