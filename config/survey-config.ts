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

export const surveyConfig: SurveyConfig = {
  id: "juice-tasting-v1",
  title: "건강주스 시음 평가",
  description:
    "저희 건강주스 시제품을 시음해주셔서 감사합니다. 솔직한 평가를 부탁드립니다.",
  welcomeMessage:
    "안녕하세요! 건강주스 시제품 평가에 참여해주셔서 감사합니다.\n소요 시간은 약 3-5분입니다.",
  thankYouMessage:
    "소중한 의견 감사합니다!\n더 좋은 제품으로 보답하겠습니다.",
  collectDemographics: true,
  sections: [
    {
      id: "sensory",
      title: "맛과 향 평가",
      description: "주스의 맛과 향에 대해 평가해주세요.",
    },
    {
      id: "texture",
      title: "질감 및 외관",
      description: "주스의 질감과 외관에 대해 평가해주세요.",
    },
    { id: "overall", title: "전반적 평가" },
    { id: "purchase", title: "구매 의향" },
    { id: "feedback", title: "추가 의견" },
  ],
  questions: [
    // === 맛과 향 평가 ===
    {
      id: "taste_overall",
      type: "rating",
      question: "전반적인 맛은 어떠셨나요?",
      required: true,
      min: 1,
      max: 5,
      section: "sensory",
    },
    {
      id: "sweetness",
      type: "scale",
      question: "단맛의 정도는 적절했나요?",
      required: true,
      min: 1,
      max: 5,
      minLabel: "너무 싱거움",
      maxLabel: "너무 달음",
      section: "sensory",
    },
    {
      id: "aroma",
      type: "rating",
      question: "향은 어떠셨나요?",
      description: "주스의 향이 얼마나 좋았는지 평가해주세요.",
      required: true,
      min: 1,
      max: 5,
      section: "sensory",
    },
    {
      id: "flavor_notes",
      type: "checkbox",
      question: "느껴지는 맛을 모두 선택해주세요.",
      required: false,
      options: [
        { value: "fruity", label: "과일향" },
        { value: "veggie", label: "채소향" },
        { value: "herbal", label: "허브향" },
        { value: "citrus", label: "시트러스" },
        { value: "earthy", label: "흙냄새/풀냄새" },
        { value: "sweet", label: "달콤함" },
        { value: "sour", label: "새콤함" },
        { value: "bitter", label: "쓴맛" },
      ],
      section: "sensory",
    },

    // === 질감 및 외관 ===
    {
      id: "texture_rating",
      type: "rating",
      question: "질감(식감)은 어떠셨나요?",
      required: true,
      min: 1,
      max: 5,
      section: "texture",
    },
    {
      id: "thickness",
      type: "scale",
      question: "농도는 적절했나요?",
      required: true,
      min: 1,
      max: 5,
      minLabel: "너무 묽음",
      maxLabel: "너무 걸쭉함",
      section: "texture",
    },
    {
      id: "color_appeal",
      type: "rating",
      question: "색상/외관은 매력적이었나요?",
      required: true,
      min: 1,
      max: 5,
      section: "texture",
    },

    // === 전반적 평가 ===
    {
      id: "overall_satisfaction",
      type: "rating",
      question: "전반적인 만족도는 어떠셨나요?",
      required: true,
      min: 1,
      max: 5,
      section: "overall",
    },
    {
      id: "health_perception",
      type: "scale",
      question: "이 주스가 건강에 좋다고 느끼셨나요?",
      required: true,
      min: 1,
      max: 5,
      minLabel: "전혀 그렇지 않다",
      maxLabel: "매우 그렇다",
      section: "overall",
    },
    {
      id: "compared_to_others",
      type: "radio",
      question: "기존에 드셔본 건강주스와 비교하면?",
      required: true,
      options: [
        { value: "much_better", label: "훨씬 좋다" },
        { value: "better", label: "좋다" },
        { value: "similar", label: "비슷하다" },
        { value: "worse", label: "좋지 않다" },
        { value: "much_worse", label: "훨씬 좋지 않다" },
        { value: "no_experience", label: "비교 대상 없음" },
      ],
      section: "overall",
    },

    // === 구매 의향 ===
    {
      id: "purchase_intent",
      type: "radio",
      question: "이 주스가 출시되면 구매하실 의향이 있으신가요?",
      required: true,
      options: [
        { value: "definitely", label: "반드시 구매할 것이다" },
        { value: "probably", label: "아마 구매할 것이다" },
        { value: "maybe", label: "잘 모르겠다" },
        { value: "probably_not", label: "아마 구매하지 않을 것이다" },
        { value: "definitely_not", label: "절대 구매하지 않을 것이다" },
      ],
      section: "purchase",
    },
    {
      id: "price_range",
      type: "radio",
      question: "적정하다고 생각하는 가격대는? (350ml 기준)",
      required: true,
      options: [
        { value: "under_3000", label: "3,000원 이하" },
        { value: "3000_5000", label: "3,000원 ~ 5,000원" },
        { value: "5000_7000", label: "5,000원 ~ 7,000원" },
        { value: "7000_10000", label: "7,000원 ~ 10,000원" },
        { value: "over_10000", label: "10,000원 이상" },
      ],
      section: "purchase",
    },
    {
      id: "recommend_likelihood",
      type: "scale",
      question: "주변에 이 주스를 추천할 의향이 있으신가요?",
      description: "0점(전혀 추천하지 않음) ~ 10점(적극 추천)",
      required: true,
      min: 0,
      max: 10,
      minLabel: "전혀 추천하지 않겠다",
      maxLabel: "적극 추천하겠다",
      section: "purchase",
    },

    // === 추가 의견 ===
    {
      id: "liked_most",
      type: "textarea",
      question: "이 주스에서 가장 좋았던 점은 무엇인가요?",
      required: false,
      placeholder: "자유롭게 작성해주세요...",
      section: "feedback",
    },
    {
      id: "improvement_suggestion",
      type: "textarea",
      question: "개선되었으면 하는 점이 있다면 알려주세요.",
      required: false,
      placeholder: "자유롭게 작성해주세요...",
      section: "feedback",
    },
  ],
};
