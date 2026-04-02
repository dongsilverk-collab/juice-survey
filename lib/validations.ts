import { z } from "zod";
import { surveyConfig } from "@/config/survey-config";

export function buildSurveySchema() {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const q of surveyConfig.questions) {
    let fieldSchema: z.ZodTypeAny;

    switch (q.type) {
      case "rating":
      case "scale":
        fieldSchema = z.number().min(q.min ?? 1).max(q.max ?? 5);
        break;
      case "radio":
        fieldSchema = z.string().min(1, "선택해주세요");
        break;
      case "checkbox":
        fieldSchema = z.array(z.string());
        break;
      case "text":
      case "textarea":
        fieldSchema = z.string();
        break;
      default:
        fieldSchema = z.any();
    }

    shape[q.id] = q.required ? fieldSchema : fieldSchema.optional();
  }

  return z.object(shape);
}

export const demographicsSchema = z.object({
  respondent_name: z.string().optional(),
  respondent_age_group: z.string().optional(),
  respondent_gender: z.string().optional(),
});
