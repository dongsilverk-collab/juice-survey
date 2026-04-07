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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronRight } from "lucide-react";

const SURVEY_ID = "a0000000-0000-0000-0000-000000000001";

type Answers = Record<string, string | number | string[]>;

export function SurveyForm() {
  const router = useRouter();

  // 0 = 기본정보, 1~N = 제품별 평가
  const [step, setStep] = useState(0);
  const [demographics, setDemographics] = useState({
    respondent_name: "",
    respondent_age_group: "",
    respondent_gender: "",
  });
  // 제품별 답변 모음
  const [allAnswers, setAllAnswers] = useState<Record<string, Answers>>(
    () => Object.fromEntries(PRODUCTS.map((p) => [p.id, {}]))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentProduct = PRODUCTS[step - 1];
  const isLastProduct = step === PRODUCTS.length;
  const isDemographicsStep = step === 0;

  const currentAnswers = currentProduct ? allAnswers[currentProduct.id] : {};

  const handleAnswerChange = (questionId: string, value: string | number | string[]) => {
    if (!currentProduct) return;
    setAllAnswers((prev) => ({
      ...prev,
      [currentProduct.id]: { ...prev[currentProduct.id], [questionId]: value },
    }));
    if (errors[questionId]) {
      setErrors((prev) => { const n = { ...prev }; delete n[questionId]; return n; });
    }
  };

  const validateCurrentProduct = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const q of surveyConfig.questions) {
      if (!q.required) continue;
      const val = currentAnswers[q.id];
      if (val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
        newErrors[q.id] = "필수 항목입니다";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentProduct()) {
      const firstErrorId = Object.keys(errors)[0]
        ?? surveyConfig.questions.find((q) => q.required && !currentAnswers[q.id])?.id;
      if (firstErrorId) {
        document.getElementById(`q-${firstErrorId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentProduct()) return;
    setSubmitting(true);
    try {
      await Promise.all(
        PRODUCTS.map((product) =>
          fetch("/api/responses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              survey_id: SURVEY_ID,
              ...demographics,
              answers: { product: product.id, ...allAnswers[product.id] },
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

  // 진행률
  const totalSteps = PRODUCTS.length + 1; // 기본정보 + 제품들
  const progress = (step / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* 진행률 */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-2 pt-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1 text-center">
          {isDemographicsStep
            ? "기본 정보 입력"
            : `${step} / ${PRODUCTS.length} 제품 평가 중`}
        </p>
      </div>

      {/* 기본 정보 */}
      {isDemographicsStep && (
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
      )}

      {/* 제품별 평가 */}
      {currentProduct && (
        <>
          <div className="text-center space-y-1 py-2">
            <p className="text-sm text-muted-foreground">
              {step} / {PRODUCTS.length}번째 제품
            </p>
            <h2 className="text-xl font-bold">{currentProduct.label}</h2>
          </div>

          {groupedQuestions.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
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
        </>
      )}

      {/* 버튼 */}
      {isDemographicsStep ? (
        <Button
          size="lg"
          className="w-full text-base"
          onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        >
          평가 시작하기
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      ) : isLastProduct ? (
        <Button
          size="lg"
          className="w-full text-base"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />제출 중...</>
          ) : (
            "전체 제출하기"
          )}
        </Button>
      ) : (
        <Button
          size="lg"
          className="w-full text-base"
          onClick={handleNext}
        >
          다음 제품 평가하기
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
