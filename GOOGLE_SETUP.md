# Google Cloud Console OAuth 2.0 설정 가이드

## 1. Google Cloud Console 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 이름: "FitGrow PAPS App"

## 2. Google Sheets API 활성화

1. 왼쪽 메뉴 > "APIs & Services" > "Library"
2. "Google Sheets API" 검색 후 활성화
3. "Google Drive API"도 검색 후 활성화

## 3. OAuth 2.0 클라이언트 ID 생성

### Android 설정
1. "APIs & Services" > "Credentials" > "Create Credentials" > "OAuth Client ID"
2. Application type: "Android"
3. Package name: `com.fitgrow` (package.json에서 확인)
4. SHA-1 certificate fingerprint 획득:
   ```bash
   # 개발용 디버그 키
   keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
   ```

### iOS 설정
1. "Create Credentials" > "OAuth Client ID" 
2. Application type: "iOS"
3. Bundle ID: `com.fitgrow` (iOS 프로젝트에서 확인)

### Web Client (백엔드용)
1. "Create Credentials" > "OAuth Client ID"
2. Application type: "Web application"
3. 이름: "FitGrow Backend"
4. Authorized redirect URIs: `http://localhost:3001/auth/google/callback`

## 4. 필요한 정보 수집

다음 정보를 `.env` 파일에 저장하세요:

```env
# Google OAuth 2.0 Client IDs
GOOGLE_WEB_CLIENT_ID=your_web_client_id_here
GOOGLE_ANDROID_CLIENT_ID=your_android_client_id_here  
GOOGLE_IOS_CLIENT_ID=your_ios_client_id_here

# Service Account (서버용)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 5. OAuth 동의 화면 설정

1. "APIs & Services" > "OAuth consent screen"
2. User Type: "External" (또는 조직내 사용시 "Internal")
3. 앱 정보:
   - App name: "FitGrow"
   - User support email: 개발자 이메일
   - App logo: 앱 로고 업로드 (선택사항)
4. 스코프 추가:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

## 다음 단계

1. 위 설정 완료 후 클라이언트 ID들을 프로젝트 설정 파일에 추가
2. React Native 앱에서 Google Sign-In 구현
3. 백엔드에서 토큰 검증 및 Google Sheets API 연동