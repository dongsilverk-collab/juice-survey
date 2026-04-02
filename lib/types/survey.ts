export interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_name: string | null;
  respondent_age_group: string | null;
  respondent_gender: string | null;
  answers: Record<string, string | number | string[]>;
  submitted_at: string;
}

export interface SurveyFormData {
  respondent_name?: string;
  respondent_age_group?: string;
  respondent_gender?: string;
  answers: Record<string, string | number | string[]>;
}

export interface SurveyStats {
  totalResponses: number;
  averageRatings: Record<string, number>;
  ratingDistribution: Record<string, Record<number, number>>;
  purchaseIntentBreakdown: Record<string, number>;
  npsScore: number;
  recentResponses: SurveyResponse[];
}
