"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { surveyConfig } from "@/config/survey-config";
import { QuestionRenderer } from "./question-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

const SURVEY_ID = "a0000000-0000-0000-0000-000000000001";

export function SurveyForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [demographics, setDemographics] = useState({
    respondent_name: "",
    respondent_age_group: "",
    respondent_gender: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const totalRequired = surveyConfig.questions.filter((q) => q.required).length;
  const answeredRequired = surveyConfig.questions.filter(
    (q) => q.required && answers[q.id] !== undefined && answers[q.id] !== ""
  ).length;
  const progress = totalRequired > 0 ? (answeredRequired / totalRequired) * 100 : 0;

  const handleAnswerChange = (questionId: string, value: string | number | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const q of surveyConfig.questions) {
      if (!q.required) continue;
      const val = answers[q.id];
      if (val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
        newErrors[q.id] = "필수 항목입니다";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErrorId = Object.keys(errors)[0] ?? surveyConfig.questions.find(q => q.required && !answers[q.id])?.id;
      if (firstErrorId) {
        document.getElementById(`q-${firstErrorId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_id: SURVEY_ID,
          ...demographics,
          answers,
        }),
      });

      if (!res.ok) throw new Error("제출 실패");

      localStorage.setItem("survey_submitted", "true");
      router.push("/survey/complete");
    } catch {
      alert("설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const groupedQuestions = surveyConfig.sections.map((section) => ({
    ...section,
    questions: surveyConfig.questions.filter((q) => q.section === section.id),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-2 pt-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1 text-center">
          {answeredRequired} / {totalRequired} 완료
        </p>
      </div>

      {surveyConfig.collectDemographics && (
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
                onChange={(e) =>
                  setDemographics((d) => ({ ...d, respondent_name: e.target.value }))
                }
                placeholder="이름을 입력해주세요"
              />
            </div>
            <div className="space-y-2">
              <Label>연령대</Label>
              <RadioGroup
                value={demographics.respondent_age_group}
                onValueChange={(v) =>
                  setDemographics((d) => ({ ...d, respondent_age_group: v }))
                }
                className="flex flex-wrap gap-2"
              >
                {["10대", "20대", "30대", "40대", "50대", "60대 이상"].map(
                  (age) => (
                    <div key={age} className="flex items-center space-x-1">
                      <RadioGroupItem value={age} id={`age-${age}`} />
                      <Label htmlFor={`age-${age}`} className="text-sm cursor-pointer">
                        {age}
                      </Label>
                    </div>
                  )
                )}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>성별</Label>
              <RadioGroup
                value={demographics.respondent_gender}
                onValueChange={(v) =>
                  setDemographics((d) => ({ ...d, respondent_gender: v }))
                }
                className="flex gap-4"
              >
                {[
                  { value: "male", label: "남성" },
                  { value: "female", label: "여성" },
                  { value: "other", label: "기타" },
                ].map((g) => (
                  <div key={g.value} className="flex items-center space-x-1">
                    <RadioGroupItem value={g.value} id={`gender-${g.value}`} />
                    <Label htmlFor={`gender-${g.value}`} className="text-sm cursor-pointer">
                      {g.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

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
                  value={answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  error={errors[question.id]}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button
        type="submit"
        size="lg"
        className="w-full text-base"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            제출 중...
          </>
        ) : (
          "설문 제출하기"
        )}
      </Button>
    </form>
  );
}
