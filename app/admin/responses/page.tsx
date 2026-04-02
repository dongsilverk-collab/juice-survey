"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SurveyResponse } from "@/lib/types/survey";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function ResponsesPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/responses?page=${page}&limit=15`)
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setResponses(data.responses);
          setTotalPages(data.totalPages);
          setTotal(data.total);
        }
      })
      .catch(() => alert("데이터 로드 실패"))
      .finally(() => setLoading(false));
  }, [page, router]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="flex-1 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">응답 목록</h1>
            <p className="text-muted-foreground">총 {total}개의 응답</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">설문 응답</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : responses.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                아직 응답이 없습니다
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead>연령대</TableHead>
                        <TableHead>만족도</TableHead>
                        <TableHead>구매의향</TableHead>
                        <TableHead>NPS</TableHead>
                        <TableHead>제출일시</TableHead>
                        <TableHead className="w-[80px]">상세</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map((r, idx) => (
                        <>
                          <TableRow
                            key={r.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() =>
                              setExpandedId(expandedId === r.id ? null : r.id)
                            }
                          >
                            <TableCell className="font-mono text-xs">
                              {(page - 1) * 15 + idx + 1}
                            </TableCell>
                            <TableCell>{r.respondent_name || "-"}</TableCell>
                            <TableCell>{r.respondent_age_group || "-"}</TableCell>
                            <TableCell>
                              {r.answers?.overall_satisfaction != null ? (
                                <Badge variant="secondary">
                                  {String(r.answers.overall_satisfaction)}/5
                                </Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {r.answers?.purchase_intent
                                ? String(r.answers.purchase_intent)
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {r.answers?.recommend_likelihood != null
                                ? String(r.answers.recommend_likelihood)
                                : "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(r.submitted_at)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedId(
                                    expandedId === r.id ? null : r.id
                                  );
                                }}
                              >
                                {expandedId === r.id ? "접기" : "펼치기"}
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expandedId === r.id && (
                            <TableRow key={`${r.id}-detail`}>
                              <TableCell colSpan={8} className="bg-muted/30">
                                <div className="p-4 space-y-2">
                                  <h4 className="font-semibold text-sm mb-3">
                                    전체 응답 상세
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    {Object.entries(r.answers).map(
                                      ([key, val]) => (
                                        <div
                                          key={key}
                                          className="flex gap-2"
                                        >
                                          <span className="text-muted-foreground min-w-[140px]">
                                            {key}:
                                          </span>
                                          <span className="font-medium">
                                            {Array.isArray(val)
                                              ? val.join(", ")
                                              : String(val)}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* 페이지네이션 */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    {page} / {totalPages} 페이지
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
