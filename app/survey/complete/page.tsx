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

          <Link href="/">
            <Button variant="outline" className="mt-2">
              처음으로 돌아가기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
