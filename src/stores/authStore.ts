import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../services/authService';

export type UserMode = 'student' | 'teacher';

export interface AuthState {
  // 인증 상태
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // 사용자 정보
  user: User | null;
  idToken: string | null;
  refreshToken: string | null;
  
  // 모드 정보
  selectedMode: UserMode | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setAuth: (user: User, idToken: string, refreshToken?: string) => void;
  setMode: (mode: UserMode) => void;
  updateUser: (userData: Partial<User>) => void;
  signOut: () => void;
  
  // 토큰 관리
  updateTokens: (idToken: string, refreshToken?: string) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isAuthenticated: false,
      isLoading: false,
      user: null,
      idToken: null,
      refreshToken: null,
      selectedMode: null,

      // Loading 상태 관리
      setLoading: (loading: boolean) => 
        set({ isLoading: loading }),

      // 인증 완료 시 호출
      setAuth: (user: User, idToken: string, refreshToken?: string) => 
        set({
          isAuthenticated: true,
          isLoading: false,
          user,
          idToken,
          refreshToken: refreshToken || null,
        }),

      // 사용자 모드 설정
      setMode: (mode: UserMode) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            selectedMode: mode,
            user: { ...currentUser, mode },
          });
        }
      },

      // 사용자 정보 업데이트
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      // 로그아웃
      signOut: () => 
        set({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          idToken: null,
          refreshToken: null,
          selectedMode: null,
        }),

      // 토큰 업데이트 (토큰 갱신 시 사용)
      updateTokens: (idToken: string, refreshToken?: string) =>
        set({
          idToken,
          refreshToken: refreshToken || get().refreshToken,
        }),

      // 토큰 제거
      clearTokens: () =>
        set({
          idToken: null,
          refreshToken: null,
        }),
    }),
    {
      name: 'fitgrow-auth-storage', // AsyncStorage 키
      storage: createJSONStorage(() => AsyncStorage),
      
      // 민감한 정보는 지속되지 않도록 설정
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        selectedMode: state.selectedMode,
        // 토큰은 보안상 세션 스토리지만 사용
      }),
    }
  )
);

// 인증 상태 선택자들
export const useAuth = () => {
  const { isAuthenticated, isLoading, user, selectedMode } = useAuthStore();
  return { isAuthenticated, isLoading, user, selectedMode };
};

export const useAuthActions = () => {
  const { setAuth, setMode, updateUser, signOut, setLoading } = useAuthStore();
  return { setAuth, setMode, updateUser, signOut, setLoading };
};

export const useTokens = () => {
  const { idToken, refreshToken, updateTokens, clearTokens } = useAuthStore();
  return { idToken, refreshToken, updateTokens, clearTokens };
};

// 사용자 권한 체크 유틸리티
export const checkUserPermission = (
  userMode: UserMode | null,
  requiredMode: UserMode
): boolean => {
  return userMode === requiredMode;
};

// 인증된 사용자인지 확인하는 Hook
export const useRequireAuth = () => {
  const { isAuthenticated, user } = useAuth();
  
  return {
    isAuthenticated,
    isReady: isAuthenticated && user !== null,
    user,
  };
};