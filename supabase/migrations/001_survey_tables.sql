-- 설문 정의 테이블
create table surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 설문 응답 테이블
create table survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys on delete cascade not null,
  respondent_name text,
  respondent_age_group text,
  respondent_gender text,
  answers jsonb not null default '{}',
  submitted_at timestamptz default now()
);

-- 인덱스
create index idx_responses_survey on survey_responses(survey_id);
create index idx_responses_submitted on survey_responses(submitted_at desc);
create index idx_responses_answers on survey_responses using gin(answers);

-- RLS 활성화
alter table surveys enable row level security;
alter table survey_responses enable row level security;

-- 누구나 활성 설문 조회 가능
create policy "Anyone can view active surveys" on surveys
  for select using (is_active = true);

-- 누구나 응답 제출 가능
create policy "Anyone can submit responses" on survey_responses
  for insert with check (true);

-- 초기 설문 데이터 삽입
insert into surveys (id, title, description)
values (
  'a0000000-0000-0000-0000-000000000001',
  '건강주스 시음 평가',
  '건강주스 시제품 시음 평가 설문지'
);
