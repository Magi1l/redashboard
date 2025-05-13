## 운영 알림/임계치 환경변수 설정

- 슬랙/웹훅 알림: `SLACK_WEBHOOK_URL`, `ALERT_WEBHOOK_URL`
- 에러율 임계치: `ERROR_RATE_THRESHOLD` (기본 0.2 = 20%)
- 평균 응답시간 임계치: `AVG_MS_THRESHOLD` (기본 2000ms)

```env
SLACK_WEBHOOK_URL=슬랙_웹훅_URL
ALERT_WEBHOOK_URL=기타_웹훅_URL
ERROR_RATE_THRESHOLD=0.2
AVG_MS_THRESHOLD=2000
``` 