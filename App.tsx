import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import AuthScreen from './src/screens/AuthScreen';
import ModeSelectionScreen from './src/screens/ModeSelectionScreen';
import UserProfile from './src/components/UserProfile';
import { User } from './src/services/authService';
import { useAuthStore } from './src/stores/authStore';
import { useAuthRestore, useTokenRefresh } from './src/hooks/useAuth';

export default function App() {
  const { 
    isAuthenticated, 
    user, 
    selectedMode, 
    isLoading,
    setAuth,
    setMode 
  } = useAuthStore();
  
  const { isRestoring } = useAuthRestore();
  useTokenRefresh();

  const [showModeSelection, setShowModeSelection] = useState(false);

  const handleAuthComplete = (authenticatedUser: User, tokens: { idToken: string; refreshToken?: string }) => {
    setAuth(authenticatedUser, tokens.idToken, tokens.refreshToken);
    
    // 모드가 설정되지 않은 경우 모드 선택 화면 표시
    if (!authenticatedUser.mode) {
      setShowModeSelection(true);
    }
  };

  const handleModeSelected = (mode: 'student' | 'teacher') => {
    setMode(mode);
    setShowModeSelection(false);
  };

  const handleModeChange = () => {
    // 모드 변경 후 필요한 작업들
    console.log('Mode changed, refreshing app state...');
  };

  // 앱 복구 중이거나 로딩 중
  if (isRestoring || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>
          {isRestoring ? '인증 상태를 확인하는 중...' : '로딩 중...'}
        </Text>
      </View>
    );
  }

  // 인증되지 않은 상태
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <AuthScreen onAuthComplete={handleAuthComplete} />
      </View>
    );
  }

  // 모드 선택이 필요한 상태
  if (!selectedMode || showModeSelection) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <ModeSelectionScreen 
          user={user} 
          onModeSelected={handleModeSelected}
        />
      </View>
    );
  }

  // 메인 앱 화면
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.mainApp}>
        {/* 사용자 프로필 */}
        <UserProfile 
          showModeChange={true}
          onModeChange={handleModeChange}
        />
        
        {/* 메인 컨텐츠 */}
        <View style={styles.mainContent}>
          <Text style={styles.welcomeText}>
            안녕하세요, {user.name}님!
          </Text>
          <Text style={styles.modeText}>
            현재 모드: {selectedMode === 'student' ? '🎒 학생' : '👩‍🏫 교사'}
          </Text>
          <Text style={styles.infoText}>
            Task 3 사용자 인증 시스템이 완료되었습니다!{'\n'}
            다음 작업에서 실제 앱 기능들을 구현할 예정입니다.
          </Text>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>구현된 기능들:</Text>
            <Text style={styles.featureItem}>✅ Google OAuth 2.0 인증</Text>
            <Text style={styles.featureItem}>✅ 학생/교사 모드 분리</Text>
            <Text style={styles.featureItem}>✅ JWT 토큰 기반 세션 관리</Text>
            <Text style={styles.featureItem}>✅ Zustand 상태 관리</Text>
            <Text style={styles.featureItem}>✅ 권한 제어 시스템</Text>
            <Text style={styles.featureItem}>✅ 자동 토큰 갱신</Text>
            <Text style={styles.featureItem}>✅ 모드별 접근 제어</Text>
          </View>
          
          {/* TODO: Task 5에서 네비게이션과 실제 화면들을 추가할 예정 */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 12,
  },
  mainApp: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  modeText: {
    fontSize: 18,
    color: '#3498db',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  featuresContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    width: '100%',
    maxWidth: 350,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureItem: {
    fontSize: 14,
    color: '#27ae60',
    marginBottom: 6,
    paddingLeft: 10,
  },
});
