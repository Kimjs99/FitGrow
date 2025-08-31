# iOS Google Sign-In 설정

## 1. GoogleService-Info.plist 파일 추가

1. Google Cloud Console에서 다운로드한 `GoogleService-Info.plist` 파일을 iOS 프로젝트에 추가
2. Xcode에서:
   - 프로젝트 네비게이터에서 프로젝트 루트 선택
   - `GoogleService-Info.plist` 파일을 드래그앤드롭
   - "Add to target"에서 앱 타겟 선택

## 2. URL Scheme 설정

### Info.plist 설정
`ios/FitGrow/Info.plist`에 URL Scheme 추가:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string></string>
        <key>CFBundleURLSchemes</key>
        <array>
            <!-- GoogleService-Info.plist의 REVERSED_CLIENT_ID 값 -->
            <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

## 3. Bundle Identifier 설정

Xcode에서 Bundle Identifier가 Google Cloud Console과 일치하는지 확인:
- Xcode > 프로젝트 선택 > Target > General > Bundle Identifier
- 예: `com.fitgrow`

## 4. AppDelegate 설정

### AppDelegate.h (Objective-C)
```objc
#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
```

### AppDelegate.m (Objective-C)
```objc
#import "AppDelegate.h"
#import <GoogleSignIn/GoogleSignIn.h>
// ... 다른 imports

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // GoogleService-Info.plist에서 설정 로드
  NSString *plistPath = [[NSBundle mainBundle] pathForResource:@"GoogleService-Info" ofType:@"plist"];
  NSDictionary *plist = [NSDictionary dictionaryWithContentsOfFile:plistPath];
  NSString *clientId = [plist objectForKey:@"CLIENT_ID"];
  
  if (clientId) {
    [GIDSignIn.sharedInstance configureWithClientID:clientId];
  }
  
  // ... 기존 코드
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [GIDSignIn.sharedInstance handleURL:url];
}
```

## 5. Swift 프로젝트인 경우

### AppDelegate.swift
```swift
import UIKit
import GoogleSignIn

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // GoogleService-Info.plist에서 CLIENT_ID 읽기
        guard let plistPath = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
              let plist = NSDictionary(contentsOfFile: plistPath),
              let clientId = plist["CLIENT_ID"] as? String else {
            fatalError("GoogleService-Info.plist not found or CLIENT_ID missing")
        }
        
        GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientId)
        
        return true
    }
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        return GIDSignIn.sharedInstance.handle(url)
    }
}
```

## 6. Podfile 업데이트 (필요한 경우)

```ruby
platform :ios, '11.0'

target 'FitGrow' do
  # ... 기존 pods
  pod 'GoogleSignIn'
end
```

설정 후 `cd ios && pod install` 실행

## 7. 테스트

1. 시뮬레이터에서 앱 실행
2. Google 로그인 버튼 탭
3. 브라우저에서 Google 계정 선택
4. 앱으로 다시 돌아와서 로그인 성공 확인