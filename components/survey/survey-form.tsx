"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { surveyConfig, PRODUCTS } from "@/config/survey-config";
import { QuestionRenderer } from "./question-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Loader2, ChevronRight, CheckCircle2 } from "lucide-react";

const SURVEY_ID = "a0000000-0000-0000-0000-000000000001";
type Answers = Record<string, string | number | string[]>;

// 단계: "info" → "select" → 제품 ID (순서 자유)
type Step = "info" | "select" | string;

export function SurveyForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [demographics, setDemographics] = useState({
    respondent_name: "",
    respondent_age_group: "",
    respondent_gender: "",
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [allAnswers, setAllAnswers] = useState<Record<string, Answers>>(
    () => Object.fromEntries(PRODUCTS.map((p) => [p.id, {}]))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentAnswers = typeof step === "string" && step !== "info" && step !== "select"
    ? allAnswers[step] ?? {}
    : {};

  // 현재 제품의 필수 항목이 모두 채워졌는지
  const isProductDone = (productId: string) => {
    const ans = allAnswers[productId] ?? {};
    return surveyConfig.questions
      .filter((q) => q.required)
      .every((q) => {
        const v = ans[q.id];
        return v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);
      });
  };

  const handleAnswerChange = (questionId: string, value: string | number | string[]) => {
    if (!step || step === "info" || step === "select") return;
    setAllAnswers((prev) => ({
      ...prev,
      [step]: { ...prev[step], [questionId]: value },
    }));
    if (errors[questionId]) {
      setErrors((prev) => { const n = { ...prev }; delete n[questionId]; return n; });
    }
  };

  const validateCurrent = (): boolean => {
    if (!step || step === "info" || step === "select") return true;
    const newErrors: Record<string, string> = {};
    for (const q of surveyConfig.questions) {
      if (!q.required) continue;
      const val = currentAnswers[q.id];
      if (val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
        newErrors[q.id] = "필수 항목입니다";
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstId = surveyConfig.questions.find((q) => q.required && !currentAnswers[q.id])?.id;
      if (firstId) document.getElementById(`q-${firstId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  const goToProduct = (productId: string) => {
    if (step !== "info" && step !== "select") {
      // 현재 제품 저장은 이미 실시간으로 됨, 그냥 이동
    }
    setErrors({});
    setStep(productId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateCurrent()) return;
    const doneProducts = selectedProducts.filter((id) => isProductDone(id));
    if (doneProducts.length === 0) {
      alert("최소 한 개 제품을 평가해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await Promise.all(
        doneProducts.map((productId) =>
          fetch("/api/responses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              survey_id: SURVEY_ID,
              ...demographics,
              answers: { product: productId, ...allAnswers[productId] },
            }),
          })
        )
      );
      localStorage.setItem("survey_submitted", "true");
      router.push("/survey/complete");
    } catch {
      alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const groupedQuestions = surveyConfig.sections.map((section) => ({
    ...section,
    questions: surveyConfig.questions.filter((q) => q.section === section.id),
  }));

  const doneCount = selectedProducts.filter(isProductDone).length;

  // ── 기본 정보 단계 ──────────────────────────────────────
  if (step === "info") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">기본 정보</CardTitle>
            <CardDescription>선택 사항입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={demographics.respondent_name}
                onChange={(e) => setDemographics((d) => ({ ...d, respondent_name: e.target.value }))}
                placeholder="이름을 입력해주세요"
              />
            </div>
            <div className="space-y-2">
              <Label>연령대</Label>
              <RadioGroup
                value={demographics.respondent_age_group}
                onValueChange={(v) => setDemographics((d) => ({ ...d, respondent_age_group: v }))}
                className="flex flex-wrap gap-2"
              >
                {["10대", "20대", "30대", "40대", "50대", "60대 이상"].map((age) => (
                  <div key={age} className="flex items-center space-x-1">
                    <RadioGroupItem value={age} id={`age-${age}`} />
                    <Label htmlFor={`age-${age}`} className="text-sm cursor-pointer">{age}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>성별</Label>
              <RadioGroup
                value={demographics.respondent_gender}
                onValueChange={(v) => setDemographics((d) => ({ ...d, respondent_gender: v }))}
                className="flex gap-4"
              >
                {[{ value: "male", label: "남성" }, { value: "female", label: "여성" }, { value: "other", label: "기타" }].map((g) => (
                  <div key={g.value} className="flex items-center space-x-1">
                    <RadioGroupItem value={g.value} id={`gender-${g.value}`} />
                    <Label htmlFor={`gender-${g.value}`} className="text-sm cursor-pointer">{g.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
        <Button size="lg" className="w-full" onClick={() => { setStep("select"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          다음 <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // ── 제품 선택 단계 ──────────────────────────────────────
  if (step === "select") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">시음한 제품을 선택해주세요</CardTitle>
            <CardDescription>오늘 시음한 제품만 선택하시면 됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PRODUCTS.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
                  selectedProducts.includes(p.id) ? "border-primary bg-primary/5" : "hover:bg-accent"
                )}
                onClick={() =>
                  setSelectedProducts((prev) =>
                    prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                  )
                }
              >
                <Checkbox
                  checked={selectedProducts.includes(p.id)}
                  onCheckedChange={(checked) =>
                    setSelectedProducts((prev) =>
                      checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                    )
                  }
                />
                <span className="font-medium">{p.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Button
          size="lg"
          className="w-full"
          disabled={selectedProducts.length === 0}
          onClick={() => {
            if (selectedProducts.length > 0) {
              goToProduct(selectedProducts[0]);
            }
          }}
        >
          평가 시작하기 ({selectedProducts.length}개 선택)
        </Button>
      </div>
    );
  }

  // ── 제품 평가 단계 ──────────────────────────────────────
  const currentProduct = PRODUCTS.find((p) => p.id === step)!;
  const currentIdx = selectedProducts.indexOf(step);
  const nextProductId = selectedProducts[currentIdx + 1] ?? null;

  return (
    <div className="space-y-4">
      {/* 제품 탭 네비게이션 */}
      <div className="flex gap-2 flex-wrap">
        {selectedProducts.map((pid) => {
          const p = PRODUCTS.find((x) => x.id === pid)!;
          const done = isProductDone(pid);
          const active = pid === step;
          return (
            <button
              key={pid}
              onClick={() => goToProduct(pid)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : done
                  ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                  : "bg-background hover:bg-accent border-border"
              )}
            >
              {done && !active && <CheckCircle2 className="h-3 w-3" />}
              {p.label}
            </button>
          );
        })}
      </div>

      {/* 진행 상황 */}
      <p className="text-xs text-muted-foreground text-right">
        {doneCount} / {selectedProducts.length} 완료
      </p>

      {/* 현재 제품 제목 */}
      <div className="text-center py-2">
        <h2 className="text-xl font-bold">{currentProduct.label}</h2>
      </div>

      {/* 질문 섹션 */}
      {groupedQuestions.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
            {section.description && <CardDescription>{section.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            {section.questions.map((question, idx) => (
              <div key={question.id} id={`q-${question.id}`}>
                {idx > 0 && <Separator className="mb-6" />}
                <QuestionRenderer
                  question={question}
                  value={currentAnswers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  error={errors[question.id]}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* 하단 버튼 */}
      <div className="space-y-3">
        <div className="flex gap-3">
          {nextProductId ? (
            <Button
              size="lg"
              className="flex-1"
              onClick={() => { if (validateCurrent()) goToProduct(nextProductId); }}
            >
              다음 제품 <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : null}
          <Button
            size="lg"
            variant={nextProductId ? "outline" : "default"}
            className={nextProductId ? "flex-1" : "w-full"}
            onClick={handleSubmit}
            disabled={submitting || doneCount === 0}
          >
            {submitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />제출 중...</>
              : `지금 ${doneCount}개 제출하기`}
          </Button>
        </div>
        {doneCount > 0 && doneCount < selectedProducts.length && (
          <p className="text-xs text-center text-muted-foreground">
            나머지 {selectedProducts.length - doneCount}개는 나중에 새 설문으로 제출할 수 있어요.
          </p>
        )}
      </div>
    </div>
  );
}
