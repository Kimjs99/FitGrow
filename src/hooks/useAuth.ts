import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import AuthService from '../services/authService';

// 권한 체크 Hook
export const useRequireAuth = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  return {
    isAuthenticated,
    isReady: isAuthenticated && user !== null && !isLoading,
    user,
    isLoading,
  };
};

// 모드별 권한 체크 Hook
export const useRequireMode = (requiredMode: 'student' | 'teacher') => {
  const { isAuthenticated, user, selectedMode, isLoading } = useAuthStore();
  
  const hasPermission = selectedMode === requiredMode;
  const isReady = isAuthenticated && user !== null && selectedMode !== null && !isLoading;
  
  return {
    hasPermission,
    isReady,
    currentMode: selectedMode,
    user,
    isLoading,
  };
};

// 학생 모드 전용 Hook
export const useStudentMode = () => {
  return useRequireMode('student');
};

// 교사 모드 전용 Hook
export const useTeacherMode = () => {
  return useRequireMode('teacher');
};

// 인증 상태 복구 Hook (앱 시작 시 사용)
export const useAuthRestore = () => {
  const [isRestoring, setIsRestoring] = useState(true);
  const { setAuth, signOut, setLoading } = useAuthStore();
  const authService = AuthService.getInstance();

  useEffect(() => {
    const restoreAuth = async () => {
      setIsRestoring(true);
      setLoading(true);

      try {
        // Google Sign In 상태 확인
        const isSignedIn = await authService.isSignedIn();
        
        if (isSignedIn) {
          // 사용자 정보 복구
          const user = await authService.getCurrentUser();
          const tokens = await authService.getTokens();
          
          if (user && tokens) {
            // 토큰 유효성 검증
            const isValidToken = await authService.validateToken(tokens.idToken);
            
            if (isValidToken) {
              // 유효한 경우 상태 복구
              setAuth(user, tokens.idToken, tokens.refreshToken);
            } else {
              // 토큰이 유효하지 않은 경우 토큰 갱신 시도
              const refreshedTokens = await authService.refreshTokensIfNeeded();
              
              if (refreshedTokens) {
                setAuth(user, refreshedTokens.idToken, refreshedTokens.refreshToken);
              } else {
                // 갱신 실패 시 로그아웃
                await authService.signOut();
                signOut();
              }
            }
          } else {
            // 사용자 정보가 없으면 로그아웃
            await authService.signOut();
            signOut();
          }
        } else {
          // Google에 로그인되어 있지 않으면 로컬 데이터 정리
          signOut();
        }
      } catch (error) {
        console.error('Auth restoration error:', error);
        // 오류 발생 시 로그아웃 상태로 설정
        signOut();
      } finally {
        setLoading(false);
        setIsRestoring(false);
      }
    };

    restoreAuth();
  }, []);

  return { isRestoring };
};

// 토큰 자동 갱신 Hook
export const useTokenRefresh = () => {
  const { idToken, updateTokens } = useAuthStore();
  const authService = AuthService.getInstance();

  useEffect(() => {
    if (!idToken) return;

    // 토큰 갱신 타이머 설정 (50분마다)
    const refreshInterval = setInterval(async () => {
      try {
        const refreshedTokens = await authService.refreshTokensIfNeeded();
        if (refreshedTokens) {
          updateTokens(refreshedTokens.idToken, refreshedTokens.refreshToken);
        }
      } catch (error) {
        console.error('Token refresh error:', error);
      }
    }, 50 * 60 * 1000); // 50분

    return () => clearInterval(refreshInterval);
  }, [idToken]);
};

// 권한 체크 유틸리티 함수들
export const checkModePermission = (
  currentMode: 'student' | 'teacher' | null,
  requiredMode: 'student' | 'teacher'
): boolean => {
  return currentMode === requiredMode;
};

export const checkMultiModePermission = (
  currentMode: 'student' | 'teacher' | null,
  allowedModes: ('student' | 'teacher')[]
): boolean => {
  return currentMode ? allowedModes.includes(currentMode) : false;
};