export type QuestionType =
  | "rating"
  | "scale"
  | "radio"
  | "checkbox"
  | "text"
  | "textarea";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
  section?: string;
}

export interface SurveyConfig {
  id: string;
  title: string;
  description: string;
  welcomeMessage: string;
  thankYouMessage: string;
  sections: { id: string; title: string; description?: string }[];
  questions: SurveyQuestion[];
  collectDemographics: boolean;
}

export const PRODUCT_LABELS: Record<string, string> = {
  foresthome_cca: "포레스트홈 CCA주스",
  jupsitory_abc_mild: "즙스토리 ABC주스 (마일드)",
  jupsitory_abc_original: "즙스토리 ABC주스 (오리지널)",
  therecipe_abc: "더레시피 ABC주스",
  therecipe_cocokale: "더레시피 코코케일주스",
};

export const PRODUCTS = [
  { id: "foresthome_cca", label: "포레스트홈 CCA주스" },
  { id: "jupsitory_abc_mild", label: "즙스토리 ABC주스 (마일드)" },
  { id: "jupsitory_abc_original", label: "즙스토리 ABC주스 (오리지널)" },
  { id: "therecipe_abc", label: "더레시피 ABC주스" },
  { id: "therecipe_cocokale", label: "더레시피 코코케일주스" },
];

export const surveyConfig: SurveyConfig = {
  id: "juice-tasting-v1",
  title: "건강주스 시음 평가",
  description:
    "시음하신 제품에 대해 솔직한 평가를 부탁드립니다.",
  welcomeMessage:
    "안녕하세요! 건강주스 시음 평가에 참여해주셔서 감사합니다.\n소요 시간은 약 3~5분입니다.",
  thankYouMessage:
    "소중한 의견 감사합니다!\n더 좋은 제품으로 보답하겠습니다.",
  collectDemographics: true,
  sections: [
    { id: "taste", title: "1. 맛" },
    { id: "aroma", title: "2. 향" },
    { id: "texture", title: "3. 식감" },
    { id: "package", title: "4. 패키지" },
    { id: "price", title: "5. 가격대" },
    { id: "overall", title: "6. 전반적인 만족도" },
  ],
  questions: [
    // === 1. 맛 ===
    {
      id: "taste_overall",
      type: "scale",
      question: "전반적인 맛",
      required: true,
      min: 1,
      max: 5,
      minLabel: "매우 나쁨",
      maxLabel: "매우 좋음",
      section: "taste",
    },
    {
      id: "taste_sweetness",
      type: "scale",
      question: "단맛의 정도",
      required: true,
      min: 1,
      max: 5,
      minLabel: "너무 싱거움",
      maxLabel: "너무 달음",
      section: "taste",
    },
    {
      id: "taste_comment",
      type: "textarea",
      question: "한줄평",
      required: false,
      placeholder: "맛에 대한 의견을 자유롭게 적어주세요...",
      section: "taste",
    },

    // === 2. 향 ===
    {
      id: "aroma_overall",
      type: "scale",
      question: "전반적인 향",
      required: true,
      min: 1,
      max: 5,
      minLabel: "매우 나쁨",
      maxLabel: "매우 좋음",
      section: "aroma",
    },
    {
      id: "aroma_preference",
      type: "scale",
      question: "향 선호도",
      required: true,
      min: 1,
      max: 5,
      minLabel: "싫다",
      maxLabel: "좋다",
      section: "aroma",
    },
    {
      id: "aroma_comment",
      type: "textarea",
      question: "한줄평",
      required: false,
      placeholder: "향에 대한 의견을 자유롭게 적어주세요...",
      section: "aroma",
    },

    // === 3. 식감 ===
    {
      id: "texture_overall",
      type: "scale",
      question: "전반적인 식감",
      required: true,
      min: 1,
      max: 5,
      minLabel: "매우 나쁨",
      maxLabel: "매우 좋음",
      section: "texture",
    },
    {
      id: "texture_preference",
      type: "scale",
      question: "식감 선호도",
      required: true,
      min: 1,
      max: 5,
      minLabel: "싫다",
      maxLabel: "좋다",
      section: "texture",
    },
    {
      id: "texture_comment",
      type: "textarea",
      question: "한줄평",
      required: false,
      placeholder: "식감에 대한 의견을 자유롭게 적어주세요...",
      section: "texture",
    },

    // === 4. 패키지 ===
    {
      id: "package_purchase",
      type: "scale",
      question: "사고싶다",
      required: true,
      min: 1,
      max: 5,
      minLabel: "전혀 그렇지 않다",
      maxLabel: "매우 그렇다",
      section: "package",
    },
    {
      id: "package_concept",
      type: "scale",
      question: "제품 컨셉이 직관적인가",
      required: true,
      min: 1,
      max: 5,
      minLabel: "전혀 그렇지 않다",
      maxLabel: "매우 그렇다",
      section: "package",
    },
    {
      id: "package_comment",
      type: "textarea",
      question: "한줄평",
      required: false,
      placeholder: "패키지에 대한 의견을 자유롭게 적어주세요...",
      section: "package",
    },

    // === 5. 가격대 ===
    {
      id: "price_range",
      type: "radio",
      question: "적정하다고 생각하는 가격대는?",
      required: true,
      options: [
        { value: "under_2000", label: "2,000원 이하" },
        { value: "under_3000", label: "3,000원 이하" },
        { value: "under_4000", label: "4,000원 이하" },
      ],
      section: "price",
    },
    {
      id: "price_comment",
      type: "textarea",
      question: "한줄평",
      required: false,
      placeholder: "가격에 대한 의견을 자유롭게 적어주세요...",
      section: "price",
    },

    // === 6. 전반적인 만족도 ===
    {
      id: "overall_satisfaction",
      type: "scale",
      question: "전반적인 만족도",
      required: true,
      min: 1,
      max: 5,
      minLabel: "매우 불만족",
      maxLabel: "매우 만족",
      section: "overall",
    },
  ],
};
