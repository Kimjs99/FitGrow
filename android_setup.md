# Android Google Sign-In 설정

## 1. google-services.json 파일 추가

1. Google Cloud Console에서 다운로드한 `google-services.json` 파일을 `android/app/` 폴더에 복사
2. 파일 구조:
   ```
   android/
   └── app/
       ├── google-services.json  ← 여기에 추가
       └── src/
   ```

## 2. Android Gradle 설정

### android/build.gradle (프로젝트 레벨)
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

### android/app/build.gradle (앱 레벨)
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

## 3. Package Name 설정

`android/app/build.gradle`에서 applicationId 확인:
```gradle
android {
    defaultConfig {
        applicationId "com.fitgrow"  // Google Cloud Console과 일치해야 함
    }
}
```

## 4. Proguard 설정 (Release 빌드용)

`android/app/proguard-rules.pro`:
```
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**
```

## 5. SHA-1 Fingerprint 확인

디버그 키의 SHA-1 지문:
```bash
cd android
./gradlew signingReport
```

또는:
```bash
keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
```

이 SHA-1 지문을 Google Cloud Console OAuth 클라이언트 설정에 추가해야 합니다.