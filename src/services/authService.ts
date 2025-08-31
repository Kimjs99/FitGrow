import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, HTTP_STATUS, ERROR_CODES } from '../config/api';

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  mode?: 'student' | 'teacher';
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
}

class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn() {
    GoogleSignin.configure({
      // TODO: Google Cloud Console에서 획득한 Web Client ID로 교체
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID || 'your_web_client_id_here',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
      accountName: '',
      iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
      googleServicePlistPath: '',
      profileImageSize: 120,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    });
  }

  async signIn(): Promise<{ user: User; tokens: AuthTokens } | null> {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.data && userInfo.data.idToken) {
        const user: User = {
          id: userInfo.data.user.id,
          name: userInfo.data.user.name || '',
          email: userInfo.data.user.email,
          photo: userInfo.data.user.photo || undefined,
        };

        const tokens: AuthTokens = {
          idToken: userInfo.data.idToken,
          accessToken: (await GoogleSignin.getTokens()).accessToken,
        };

        // 백엔드 서버에 인증 정보 전송
        const backendAuth = await this.authenticateWithBackend(tokens.idToken);
        
        // 백엔드에서 추가 사용자 정보 가져오기 (모드 등)
        const profileData = await this.getUserProfile(tokens.idToken);
        if (profileData.mode) {
          user.mode = profileData.mode;
        }

        // 사용자 정보를 로컬에 저장
        await this.storeUserData(user);
        await this.storeTokens(tokens);
        
        return { user, tokens };
      }
      return null;
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('사용자가 로그인을 취소했습니다.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('로그인이 진행 중입니다.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Google Play Services를 사용할 수 없습니다.');
      } else {
        console.log('알 수 없는 오류:', error);
      }
      
      return null;
    }
  }

  // 백엔드 서버와 인증 연동
  async authenticateWithBackend(idToken: string): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
        timeout: API_CONFIG.TIMEOUT,
      });

      if (!response.ok) {
        throw new Error(`백엔드 인증 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('백엔드 인증 중 오류:', error);
      throw error;
    }
  }

  // 사용자 프로필 조회 (백엔드에서)
  async getUserProfile(idToken: string): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        timeout: API_CONFIG.TIMEOUT,
      });

      if (!response.ok) {
        if (response.status === HTTP_STATUS.UNAUTHORIZED) {
          throw new Error(ERROR_CODES.AUTH_FAILED);
        }
        throw new Error('프로필 조회 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('프로필 조회 중 오류:', error);
      return {}; // 기본값 반환
    }
  }

  async signOut(): Promise<boolean> {
    try {
      // 백엔드에 로그아웃 요청
      const tokens = await this.getTokens();
      if (tokens) {
        await this.logoutFromBackend(tokens.idToken);
      }

      await GoogleSignin.signOut();
      await this.clearUserData();
      await this.clearTokens();
      return true;
    } catch (error) {
      console.error('Sign Out Error:', error);
      return false;
    }
  }

  async logoutFromBackend(idToken: string): Promise<void> {
    try {
      await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        timeout: API_CONFIG.TIMEOUT,
      });
    } catch (error) {
      console.error('백엔드 로그아웃 중 오류:', error);
      // 로그아웃은 실패해도 로컬 정리는 계속 진행
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      const isGoogleSignedIn = await GoogleSignin.isSignedIn();
      const tokens = await this.getTokens();
      const userData = await this.getCurrentUser();
      
      return isGoogleSignedIn && tokens !== null && userData !== null;
    } catch (error) {
      console.error('Check Sign In Status Error:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        return JSON.parse(userData);
      }
      
      return null;
    } catch (error) {
      console.error('Get Current User Error:', error);
      return null;
    }
  }

  async getTokens(): Promise<AuthTokens | null> {
    try {
      const tokenData = await AsyncStorage.getItem('auth_tokens');
      if (tokenData) {
        return JSON.parse(tokenData);
      }
      
      return null;
    } catch (error) {
      console.error('Get Tokens Error:', error);
      return null;
    }
  }

  async refreshTokensIfNeeded(): Promise<AuthTokens | null> {
    try {
      const tokens = await GoogleSignin.getTokens();
      
      const authTokens: AuthTokens = {
        idToken: tokens.idToken,
        accessToken: tokens.accessToken,
      };
      
      await this.storeTokens(authTokens);
      return authTokens;
    } catch (error) {
      console.error('Refresh Token Error:', error);
      return null;
    }
  }

  // 토큰 유효성 검증
  async validateToken(idToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VALIDATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        timeout: API_CONFIG.TIMEOUT,
      });

      return response.ok;
    } catch (error) {
      console.error('토큰 검증 중 오류:', error);
      return false;
    }
  }

  async setUserMode(mode: 'student' | 'teacher'): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      const tokens = await this.getTokens();
      
      if (user && tokens) {
        // 백엔드에 모드 변경 요청
        await this.updateModeInBackend(tokens.idToken, mode);
        
        // 로컬 데이터 업데이트
        user.mode = mode;
        await this.storeUserData(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Set User Mode Error:', error);
      return false;
    }
  }

  async updateModeInBackend(idToken: string, mode: 'student' | 'teacher'): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'X-User-Mode': mode,
        },
        body: JSON.stringify({ mode }),
        timeout: API_CONFIG.TIMEOUT,
      });

      if (!response.ok) {
        throw new Error('모드 변경 실패');
      }
    } catch (error) {
      console.error('백엔드 모드 변경 중 오류:', error);
      throw error;
    }
  }

  private async storeUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Store User Data Error:', error);
    }
  }

  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Store Tokens Error:', error);
    }
  }

  private async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Clear User Data Error:', error);
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_tokens');
    } catch (error) {
      console.error('Clear Tokens Error:', error);
    }
  }
}

export default AuthService;