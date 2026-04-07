import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { surveyConfig } from "@/config/survey-config";
import { CheckCircle } from "lucide-react";

export default function CompletePage() {
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">설문 완료!</h1>
            <p className="text-muted-foreground whitespace-pre-line">
              {surveyConfig.thankYouMessage}
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
              나머지 제품은 나중에 다시 설문을 시작해서 제출하면 됩니다.
            </div>
            <Link href="/survey">
              <Button className="w-full">
                나머지 제품 계속 평가하기
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                처음으로 돌아가기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
