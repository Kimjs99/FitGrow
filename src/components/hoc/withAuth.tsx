import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRequireAuth, useRequireMode } from '../../hooks/useAuth';

// 기본 인증 필요 HOC
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isReady, isLoading } = useRequireAuth();

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      );
    }

    if (!isAuthenticated || !isReady) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>인증이 필요합니다</Text>
          <Text style={styles.errorText}>
            이 기능을 사용하려면 먼저 로그인해주세요.
          </Text>
        </View>
      );
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
}

// 모드별 권한 체크 HOC
export function withModeAuth<P extends object>(
  requiredMode: 'student' | 'teacher'
) {
  return function(WrappedComponent: React.ComponentType<P>) {
    const ModeAuthComponent: React.FC<P> = (props) => {
      const { hasPermission, isReady, currentMode, isLoading } = useRequireMode(requiredMode);

      if (isLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>권한 확인 중...</Text>
          </View>
        );
      }

      if (!isReady) {
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>인증이 필요합니다</Text>
            <Text style={styles.errorText}>
              사용자 정보를 불러오는 중입니다.
            </Text>
          </View>
        );
      }

      if (!hasPermission) {
        const requiredModeKorean = requiredMode === 'student' ? '학생' : '교사';
        const currentModeKorean = currentMode === 'student' ? '학생' : '교사';
        
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>접근 권한이 없습니다</Text>
            <Text style={styles.errorText}>
              이 기능은 {requiredModeKorean} 모드에서만 사용할 수 있습니다.{'\n'}
              현재 모드: {currentModeKorean}
            </Text>
            <Text style={styles.hintText}>
              설정에서 모드를 변경할 수 있습니다.
            </Text>
          </View>
        );
      }

      return <WrappedComponent {...props} />;
    };

    ModeAuthComponent.displayName = `withModeAuth(${requiredMode})(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return ModeAuthComponent;
  };
}

// 학생 모드 전용 HOC
export function withStudentAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return withModeAuth<P>('student')(WrappedComponent);
}

// 교사 모드 전용 HOC
export function withTeacherAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return withModeAuth<P>('teacher')(WrappedComponent);
}

// 복합 권한 체크 HOC (여러 모드 허용)
export function withMultiModeAuth<P extends object>(
  allowedModes: ('student' | 'teacher')[]
) {
  return function(WrappedComponent: React.ComponentType<P>) {
    const MultiModeAuthComponent: React.FC<P> = (props) => {
      const { isAuthenticated, user, selectedMode, isLoading } = useRequireAuth();

      if (isLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>권한 확인 중...</Text>
          </View>
        );
      }

      if (!isAuthenticated || !user || !selectedMode) {
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>인증이 필요합니다</Text>
            <Text style={styles.errorText}>
              이 기능을 사용하려면 먼저 로그인하고 모드를 선택해주세요.
            </Text>
          </View>
        );
      }

      if (!allowedModes.includes(selectedMode)) {
        const allowedModesKorean = allowedModes.map(mode => 
          mode === 'student' ? '학생' : '교사'
        ).join(', ');
        const currentModeKorean = selectedMode === 'student' ? '학생' : '교사';
        
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>접근 권한이 없습니다</Text>
            <Text style={styles.errorText}>
              이 기능은 {allowedModesKorean} 모드에서만 사용할 수 있습니다.{'\n'}
              현재 모드: {currentModeKorean}
            </Text>
            <Text style={styles.hintText}>
              설정에서 모드를 변경할 수 있습니다.
            </Text>
          </View>
        );
      }

      return <WrappedComponent {...props} />;
    };

    MultiModeAuthComponent.displayName = `withMultiModeAuth(${allowedModes.join(',')})(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return MultiModeAuthComponent;
  };
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});