import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { surveyConfig } from "@/config/survey-config";
import { GlassWater } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <GlassWater className="h-8 w-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{surveyConfig.title}</h1>
            <p className="text-muted-foreground whitespace-pre-line">
              {surveyConfig.welcomeMessage}
            </p>
          </div>

          <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
            <p>총 {surveyConfig.questions.length}개 문항</p>
            <p>예상 소요 시간: 3~5분</p>
          </div>

          <Link href="/survey">
            <Button size="lg" className="w-full text-base mt-2">
              설문 시작하기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
