# 에러 핸들링/로깅/모니터링 교육 자료 (초안)

## 1. 에러 분류 및 코드 정책
- 에러 카테고리: 사용자 입력, 인증/인가, 시스템, 네트워크, 외부 API 등
- 심각도: fatal, error, warn, info, debug
- 에러 코드 체계: FE/BE 접두어 + 번호 (예: FE1001, BE4001)

## 2. 프론트엔드 에러 처리
- 글로벌 ErrorBoundary 컴포넌트
- 사용자 친화적 에러 메시지/복구 옵션
- 개발/운영 환경별 동작 차이 (stack trace, 상세 정보)
- Sentry 등 외부 모니터링 연동

### 실습 예시
```tsx
// app/components/ErrorBoundary.tsx
import React from 'react';
class ErrorBoundary extends React.Component {
  ... // (핵심 구현)
}
```

## 3. 백엔드 에러 처리/로깅
- 미들웨어 기반 에러 처리 (try/catch, errorResponse 유틸)
- 표준화된 JSON 에러 포맷
- 에러 코드/메시지 라이브러리 (다국어 지원)
- 로깅 유틸(logger.ts) 활용

### 실습 예시
```ts
// src/lib/middleware/errorResponse.ts
export function errorResponse(res, error, code = 500) {
  ... // (핵심 구현)
}

// src/lib/errors/messages.ts
export const errorMessages = {
  BE4001: '디스코드 ID와 서버 ID가 필요합니다.',
  ...
};
```

## 4. 공통 로깅/모니터링/알림 시스템
- 중앙집중 로깅(logger.ts)
- API 모니터링(metrics.ts), 성능 측정(performance.ts)
- 자동 알림(alert.ts, Discord/webhook)
- 디버그 모드(개발 환경에서만 상세 정보 노출)

### 실습 예시
```ts
// src/lib/logging/logger.ts
export const log = {
  info: (...args) => console.info(...args),
  error: (...args) => console.error(...args),
  ...
};

// src/lib/monitoring/metrics.ts
export function recordMetric(endpoint: string, status: number, duration: number, error?: string) {
  // API 호출 결과/시간 기록 및 임계치 초과시 알림
  ...
}
export function getMetrics() {
  // API별 통계 요약 반환
  ...
}

// src/lib/monitoring/alert.ts
export async function sendDiscordAlert(message: string, options?: Record<string, any>) {
  // 디스코드 웹훅으로 알림 전송, 실패시 로깅
  ...
}

// src/lib/monitoring/performance.ts
export function startTimer(label: string) {
  return { label, start: Date.now() };
}
export function endTimer(timer: { label: string; start: number }) {
  // 실행 시간 기록 및 반환
  ...
}
export async function measureDbQuery<T>(label: string, fn: () => Promise<T>): Promise<T> {
  // DB 쿼리 성능 측정 래퍼
  ...
}
```

#### 실습 시나리오
- API 라우트에서 recordMetric, startTimer/endTimer, sendDiscordAlert를 직접 호출해보고, 임계치 초과/에러 상황을 시뮬레이션
- app/dashboard/admin/logs/page.tsx에서 실시간 모니터링/알림 내역 확인
- DB 쿼리/외부 API 호출에 measureDbQuery 적용하여 성능 데이터 수집

## 5. 실전 시나리오
- 에러 발생 → 로그 기록 → 모니터링 대시보드 확인 → 알림 수신 → 대응/복구
- app/dashboard/admin/logs/page.tsx에서 실시간 모니터링/알림 확인 실습

## 6. FAQ & 체크리스트
- 자주 발생하는 실수/오류 유형
- 에러 메시지 작성 시 주의점
- 민감 정보 노출 방지
- 로그/모니터링 데이터 관리 팁

## 7. 실습용 API 라우트: /api/monitoring-test

관리자 인증이 필요한 실습용 API로, 다양한 에러/성능/알림 상황을 시뮬레이션할 수 있습니다.

### 사용 예시
- 정상: `/api/monitoring-test?type=ok`
- 강제 에러: `/api/monitoring-test?type=error`
- 성능 임계치 초과(2.5초 지연): `/api/monitoring-test?type=slow`
- 수동 알림 트리거: `/api/monitoring-test?type=alert`

### 코드 예시
```ts
// src/api/monitoring-test/route.ts
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  const timer = startTimer("/api/monitoring-test");
  let status = 200;
  let errorMsg = undefined;
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "ok";
    if (type === "error") throw new Error("강제 에러 발생 (실습)");
    if (type === "slow") await new Promise(res => setTimeout(res, 2500));
    if (type === "alert") await sendDiscordAlert("[실습] 수동 알림 트리거");
    return NextResponse.json({ message: `테스트 성공 (${type})` });
  } catch (err: any) {
    status = 500;
    errorMsg = err.message;
    await sendDiscordAlert(`[API ERROR] /api/monitoring-test: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status });
  } finally {
    const duration = endTimer(timer);
    recordMetric("/api/monitoring-test", status, duration, errorMsg);
  }
}
```

### 실습 시나리오
- 각 type별로 호출 후, **app/dashboard/admin/logs/page.tsx** 대시보드에서
  - 에러 발생 시 에러 로그/알림 내역 확인
  - 성능 임계치 초과 시 성능 경고/알림 확인
  - 수동 알림 트리거 시 알림 내역 확인
  - 정상 호출 시 모니터링 데이터(응답 시간, 성공/실패 카운트 등) 확인
- 권한 없는 계정으로 호출 시 403 에러 및 권한 체크 동작 확인

### 실습 결과 예시

#### 1. 정상 호출 (`/api/monitoring-test?type=ok`)
- **API 응답:**
  ```json
  { "message": "테스트 성공 (ok)" }
  ```
- **대시보드:**
  - 성공 카운트 증가, 평균 응답 시간 기록
  - 에러/알림 없음

#### 2. 강제 에러 (`/api/monitoring-test?type=error`)
- **API 응답:**
  ```json
  { "error": "강제 에러 발생 (실습)" }
  ```
- **대시보드:**
  - 에러 카운트 증가, 최근 에러 메시지 표시
  - 디스코드 웹훅 알림 내역에 에러 메시지 기록
  - 임계치 초과 시 경고 표시

#### 3. 성능 임계치 초과 (`/api/monitoring-test?type=slow`)
- **API 응답:**
  ```json
  { "message": "테스트 성공 (slow)" }
  ```
- **대시보드:**
  - 평균 응답 시간 증가, 성능 임계치 초과 시 경고/알림 표시
  - 디스코드 웹훅 알림 내역에 성능 경고 기록

#### 4. 수동 알림 트리거 (`/api/monitoring-test?type=alert`)
- **API 응답:**
  ```json
  { "message": "테스트 성공 (alert)" }
  ```
- **대시보드:**
  - 알림 내역에 수동 트리거 메시지 기록

#### 5. 권한 없음 (비관리자 계정)
- **API 응답:**
  ```json
  { "error": "권한 없음" }
  ```
- **대시보드:**
  - 호출 기록 없음(권한 체크에서 차단)

### FAQ / 트러블슈팅
- **Q. 디스코드/웹훅 알림이 오지 않아요!**
  - 환경변수(DISCORD_WEBHOOK_URL, DISCORD_ALERT_WEBHOOK_URL) 설정 확인
  - 서버 로그에서 알림 전송 실패 메시지 확인
- **Q. 대시보드에 데이터가 안 나와요!**
  - API 호출 후 새로고침, 로그/모니터링 데이터가 정상적으로 기록되는지 확인
- **Q. 임계치(에러율/응답시간) 기준은 어디서 바꾸나요?**
  - .env 또는 환경변수에서 ERROR_RATE_THRESHOLD, AVG_MS_THRESHOLD 값 조정
- **Q. 관리자 권한 이메일은 어디서 바꾸나요?**
  - 각 라우트 상단의 ADMIN_EMAIL 상수 또는 환경변수로 관리

### 프로필 카드 커스터마이즈 사용자 테스트 결과 (8.15)

#### 1. 테스트 시나리오별 결과
- **테마/색상/배경 변경**
  - 즉각적 반영, 렌더링 지연 없음
  - 색상 대비 경고(명암 낮음) 정상 동작
- **저장/불러오기**
  - 저장 성공/실패 메시지 명확, 네트워크 오류 시 에러 메시지 노출
- **이미지 내보내기**
  - html2canvas로 정상 저장, 일부 모바일 브라우저에서 다운로드 제한 있음(가이드 필요)
- **skeleton 로딩**
  - 데이터/이미지 불러오는 동안 skeleton 표시, UX 부드러움
- **접근성(키보드/스크린리더)**
  - Tab/Enter로 주요 기능 접근 가능, aria-label/role 정상 동작
- **모바일/저사양 환경**
  - 반응형 레이아웃, 렌더링/입력 지연 없음
- **에러/예외 상황**
  - 권한 없음/네트워크 오류 등 예외 상황에서 사용자 메시지 명확

#### 2. 실제 피드백/개선점
- [피드백] 모바일에서 이미지 내보내기 안내 필요
- [피드백] contrast 경고 문구 더 명확하게(예: "저시력자 배려 필요")
- [피드백] 저장/불러오기 실패 시 재시도 버튼 추가 요청
- [피드백] skeleton 색상 커스터마이즈 옵션 추가 요청
- [개선] 접근성: contrast 경고 발생 시 자동으로 추천 색상 제안
- [개선] 모바일에서 이미지 내보내기 지원 범위 명시 및 대체 안내

#### 3. 결론 및 다음 액션
- 주요 UX/성능/접근성 문제 없음, 실사용자 피드백 반영해 추가 개선 예정
- Taskmaster에 피드백/개선점 기록 및 우선순위별로 반영

---

## 부록: 실습용 코드/시나리오 샘플
- src/lib/errors/messages.ts, src/lib/logging/logger.ts, app/dashboard/admin/logs/page.tsx 등 실제 코드 참고
- 실습용 에러/로그/알림 시나리오 제공

---

> 최신 코드/실습 예시는 실제 레포지토리와 Taskmaster 기록을 참고하세요. 