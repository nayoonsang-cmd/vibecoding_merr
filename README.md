# Naver Blog AI Digest

자동으로 네이버 블로그를 모니터링하고, AI가 경제/시사/기술 개념을 설명한 다이제스트를 이메일로 전송하는 서비스입니다.

## 주요 기능

- 📰 **RSS 피드 모니터링**: 네이버 블로그의 새 글을 자동으로 감지
- 🤖 **AI 분석**: Google Gemini를 사용하여 복잡한 개념을 한국어로 설명
- 📧 **이메일 다이제스트**: 분석된 내용을 매일 이메일로 전송
- ⏰ **자동 스케줄링**: 매일 오전 10시(KST)에 자동 실행

## 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요:

```bash
# Google Gemini API Key
AI_API_KEY=your_gemini_api_key_here

# Gmail Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here

# Target Email
TARGET_EMAIL=recipient@example.com
```

### 환경 변수 가이드

1. **AI_API_KEY**: [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급
2. **EMAIL_PASS**: Gmail 앱 비밀번호 ([생성 방법](https://support.google.com/accounts/answer/185833))
3. **TARGET_EMAIL**: 다이제스트를 받을 이메일 주소

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

개발 서버 실행 후 http://localhost:3000 에서 확인할 수 있습니다.

## Vercel 배포

### 1. Vercel CLI 설치

```bash
npm install -g vercel
```

### 2. Vercel 로그인

```bash
vercel login
```

### 3. 배포

```bash
vercel
```

프롬프트에 따라 프로젝트를 설정하세요.

### 4. 환경 변수 설정

Vercel 대시보드에서 환경 변수를 추가하세요:

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 다음 변수들을 추가:
   - `AI_API_KEY`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `TARGET_EMAIL`

### 5. 재배포

환경 변수 추가 후 재배포:

```bash
vercel --prod
```

### 6. Cron Job 확인

- Vercel 대시보드 → Deployments → Cron Logs에서 실행 로그 확인
- 매일 오전 10시(KST) / 오전 1시(UTC)에 자동 실행됩니다

## API 엔드포인트

- `GET /api/feed` - RSS 피드 가져오기
- `POST /api/analyze` - 블로그 포스트 분석
- `GET /api/cron?action=run` - 수동으로 체크 실행
- `GET /api/cron?action=start` - 스케줄러 시작 (로컬 전용)
- `GET /api/cron?action=stop` - 스케줄러 중지 (로컬 전용)

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **AI**: Google Gemini 2.5 Flash
- **Scraping**: Cheerio, Axios
- **Email**: Nodemailer
- **Scheduling**: Vercel Cron Jobs (프로덕션), node-cron (로컬)
- **Styling**: Tailwind CSS

## 문제 해결

### 이메일이 전송되지 않는 경우

1. Gmail 앱 비밀번호가 올바른지 확인
2. Gmail 계정에서 "보안 수준이 낮은 앱의 액세스" 설정 확인
3. Vercel 로그에서 오류 메시지 확인

### Cron Job이 실행되지 않는 경우

1. `vercel.json` 파일이 올바르게 설정되었는지 확인
2. Vercel 대시보드에서 Cron Logs 확인
3. 환경 변수가 모두 설정되었는지 확인

### AI 분석이 실패하는 경우

1. `AI_API_KEY`가 올바른지 확인
2. Google AI Studio에서 API 할당량 확인
3. 네트워크 연결 상태 확인

## 라이선스

MIT
