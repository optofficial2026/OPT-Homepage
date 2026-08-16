-- occurred_on 한 칸이 정렬 기준과 화면 문구를 겸하는 바람에,
-- '2026년 상반기' 같은 표기는 문자열 치환에 의존해야만 순서가 맞았다.
-- 정렬은 실제 날짜(sorted_on)로, 화면은 자유 문구(occurred_on)로 나눈다.
alter table public.timeline_items add column if not exists sorted_on date;

-- 기존 행은 지금까지 쓰던 치환 규칙과 같은 기준으로 채운다.
update public.timeline_items set sorted_on = case
  when occurred_on ~ '^\d{4}[.-]\d{2}[.-]\d{2}$' then to_date(replace(occurred_on, '.', '-'), 'YYYY-MM-DD')
  when occurred_on ~ '^\d{4}[.-]\d{2}$'          then to_date(replace(occurred_on, '.', '-') || '-01', 'YYYY-MM-DD')
  when occurred_on like '%년 하반기%'             then to_date(substring(occurred_on from '\d{4}') || '-12-01', 'YYYY-MM-DD')
  when occurred_on like '%년 여름방학%'           then to_date(substring(occurred_on from '\d{4}') || '-08-01', 'YYYY-MM-DD')
  when occurred_on like '%년 상반기%'             then to_date(substring(occurred_on from '\d{4}') || '-06-01', 'YYYY-MM-DD')
  when occurred_on ~ '\d{4}'                     then to_date(substring(occurred_on from '\d{4}') || '-01-01', 'YYYY-MM-DD')
  else null
end
where sorted_on is null;
