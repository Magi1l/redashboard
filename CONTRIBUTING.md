# Contributing Guide

이 프로젝트에 기여하려면 아래의 코드 품질 기준과 개발 가이드를 반드시 따라야 합니다.

## 코드 품질 기준
- **TypeScript strict 옵션**이 활성화되어 있습니다. 타입 오류가 없어야 합니다.
- **ESLint**: any/let 금지, 미사용 변수, 주석 코드, 임시 코드, undefined 타입 등 엄격하게 검사합니다.
- **Prettier**: 코드 스타일은 prettier로 자동 포맷됩니다.
- **Husky + lint-staged**: 커밋 전 lint, prettier가 자동 실행됩니다.
- **CI/CD**: GitHub Actions에서 lint/type-check가 통과해야만 빌드/배포가 진행됩니다.

## 커밋/PR 체크리스트
- [ ] 타입스크립트 타입 오류가 없는지 `npx tsc --noEmit`으로 확인
- [ ] ESLint 오류가 없는지 `npx eslint . --ext .js,.ts,.tsx,.jsx`로 확인
- [ ] 코드 스타일이 prettier로 포맷되었는지 확인
- [ ] 커밋 전 `git add .` 후 커밋이 정상적으로 되는지 확인
- [ ] 주요 변경사항은 PR 설명에 상세히 작성

## 개발 환경
- Node.js 20 이상 권장
- 의존성 설치: `npm ci` 또는 `npm install`
- 개발 서버: `npx next dev` (web 디렉터리)
- 빌드: `npm run build --workspace=web`

## 기타
- 민감정보(토큰, DB URI 등)는 코드에 직접 포함하지 말고 환경변수(Secrets)로 관리
- 코드 품질 기준/규칙은 `.eslintrc.json`, `tsconfig.json`, `.prettierrc` 등에서 확인 가능
- 추가 문의/가이드 필요시 README 또는 팀에 문의 