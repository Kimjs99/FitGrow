# FitGrow 앱 배포 가이드

## 📱 배포 옵션

### 1. Expo Go를 통한 개발 빌드 공유 (가장 빠른 방법)

#### 1.1 Expo 계정 필요
먼저 [Expo 계정](https://expo.dev/signup)을 만들고 로그인하세요:

```bash
# Expo 로그인
npx expo login

# 계정 확인
npx expo whoami
```

#### 1.2 개발 서버 실행
```bash
# 개발 서버 시작
npx expo start

# 또는 터널 모드로 실행 (외부 접근 가능)
npx expo start --tunnel
```

#### 1.3 QR 코드로 공유
1. 실행 후 나타나는 QR 코드를 스캔
2. **Android**: Expo Go 앱에서 QR 코드 스캔
3. **iOS**: 카메라 앱으로 QR 코드 스캔 → Expo Go에서 열기

> **주의**: Google 로그인 기능은 실제 디바이스에서만 작동합니다.

### 2. Expo 플랫폼 배포 (권장)

#### 2.1 EAS Build 설정
```bash
# EAS CLI 설치
npm install -g @expo/eas-cli

# EAS 로그인
eas login

# 빌드 설정 초기화
eas build:configure
```

#### 2.2 미리보기 빌드 생성
```bash
# Android 미리보기 빌드
eas build --platform android --profile preview

# iOS 미리보기 빌드 (Apple Developer 계정 필요)
eas build --platform ios --profile preview
```

#### 2.3 공유 가능한 링크 생성
빌드 완료 후:
1. Expo 대시보드에서 빌드 확인
2. 다운로드 링크 또는 QR 코드 공유
3. **Android**: APK 직접 설치
4. **iOS**: TestFlight 또는 직접 설치

### 3. 웹 버전 배포

#### 3.1 웹 빌드
```bash
# 웹 빌드 실행
npx expo export --platform web

# 빌드 결과는 dist/ 폴더에 생성
```

#### 3.2 정적 호스팅 옵션

**Netlify 배포:**
1. [Netlify](https://netlify.com) 계정 생성
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build command: `npx expo export --platform web`
   - Publish directory: `dist`

**Vercel 배포:**
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel --prod
```

**GitHub Pages 배포:**
1. `package.json`에 homepage 추가:
```json
{
  "homepage": "https://username.github.io/FitGrow"
}
```

2. GitHub Actions 워크플로우 생성:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx expo export --platform web
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🚀 즉시 사용 가능한 배포 링크들

### 옵션 1: Expo Development Build (개발용)
```bash
# 1. 터미널에서 실행
npx expo start --tunnel

# 2. 생성되는 QR 코드를 사용자와 공유
# 3. Expo Go 앱으로 스캔하여 실행
```

### 옵션 2: Netlify 웹 배포 (추천)
1. **자동 배포 설정:**
   - Repository: `https://github.com/Kimjs99/FitGrow`
   - Build command: `npm run build:web`
   - Publish directory: `dist`

2. **예상 배포 URL:**
   - `https://fitgrow-paps-app.netlify.app`
   - 또는 커스텀 도메인 설정 가능

### 옵션 3: Vercel 배포
```bash
# GitHub 저장소와 연동하여 자동 배포
# 예상 URL: https://fit-grow-git-main-username.vercel.app
```

## ⚙️ 배포 전 설정 사항

### 1. 환경 변수 설정
배포 환경에서 다음 환경 변수들을 설정하세요:

```env
# Google OAuth 설정
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id  
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id

# 프로덕션 API URL
EXPO_PUBLIC_API_URL=https://your-api-server.com
```

### 2. Google OAuth 설정 업데이트
Google Cloud Console에서 배포 URL들을 승인된 도메인에 추가:

1. **웹 클라이언트 설정:**
   - Authorized JavaScript origins: `https://fitgrow-paps-app.netlify.app`
   - Authorized redirect URIs: `https://fitgrow-paps-app.netlify.app/auth/callback`

2. **앱 설정:**
   - Package name (Android): `com.fitgrow`
   - Bundle ID (iOS): `com.fitgrow`

### 3. 앱 아이콘 및 스플래시 최적화
현재 설정된 에셋들 확인:
- `./assets/icon.png` - 앱 아이콘
- `./assets/splash-icon.png` - 스플래시 화면
- `./assets/adaptive-icon.png` - Android 적응형 아이콘
- `./assets/favicon.png` - 웹 파비콘

## 📋 배포 체크리스트

### 배포 전 확인사항
- [ ] Google OAuth 클라이언트 ID 설정 완료
- [ ] 환경 변수 설정 완료
- [ ] 앱 아이콘 및 스플래시 이미지 준비
- [ ] 프로덕션 API 엔드포인트 설정
- [ ] 테스트 계정으로 로그인 기능 확인

### 배포 후 확인사항
- [ ] 앱이 정상적으로 로드되는지 확인
- [ ] Google 로그인 기능 작동 확인
- [ ] 학생/교사 모드 전환 확인
- [ ] 반응형 디자인 확인 (웹 버전)
- [ ] 다양한 디바이스에서 테스트

## 🔧 문제 해결

### 빌드 오류
**문제**: Metro bundler 오류
```bash
npx expo start --clear
```

**문제**: 의존성 충돌
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Google 로그인 오류
**문제**: OAuth 클라이언트 ID 불일치
- Google Cloud Console에서 도메인/패키지명 확인
- 환경 변수 설정 재확인

**문제**: CORS 오류 (웹 버전)
- 승인된 JavaScript origins에 배포 URL 추가

## 📞 지원

배포 관련 문제가 있다면:
1. **Expo 문서**: https://docs.expo.dev/
2. **GitHub Issues**: 프로젝트 저장소에 이슈 등록
3. **개발자 연락**: 프로젝트 관리자에게 문의

---

*이 가이드는 FitGrow v1.0.0 기준으로 작성되었습니다.*