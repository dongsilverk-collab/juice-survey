import { SurveyForm } from "@/components/survey/survey-form";
import { surveyConfig } from "@/config/survey-config";

export default function SurveyPage() {
  return (
    <main className="flex-1 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold">{surveyConfig.title}</h1>
          <p className="text-sm text-muted-foreground">
            {surveyConfig.description}
          </p>
        </div>
        <SurveyForm />
      </div>
    </main>
  );
}
