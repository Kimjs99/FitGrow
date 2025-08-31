import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import GoogleSignInButton from '../components/GoogleSignInButton';
import ModeSelectionScreen from './ModeSelectionScreen';
import AuthService, { User } from '../services/authService';

interface Props {
  onAuthComplete: (user: User, tokens: { idToken: string; refreshToken?: string }) => void;
}

const AuthScreen: React.FC<Props> = ({ onAuthComplete }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  
  const authService = AuthService.getInstance();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        if (currentUser.mode) {
          // 사용자가 이미 모드를 선택했으면 바로 앱으로 이동
          onAuthComplete(currentUser);
        } else {
          // 로그인은 했지만 모드를 선택하지 않았으면 모드 선택 화면으로
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error('Auth status check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInSuccess = (result: { user: User; tokens: { idToken: string; refreshToken?: string } }) => {
    setSigningIn(false);
    
    if (result.user.mode) {
      // 이미 모드가 설정된 경우 바로 완료
      onAuthComplete(result.user, result.tokens);
    } else {
      // 모드가 설정되지 않은 경우 모드 선택 단계로
      setUser(result.user);
    }
  };

  const handleSignInError = (error: string) => {
    setSigningIn(false);
    console.error('Sign in error:', error);
  };

  const handleModeSelected = (mode: 'student' | 'teacher') => {
    if (user) {
      const userWithMode = { ...user, mode };
      // 여기서는 임시 토큰을 전달 (실제로는 AuthService에서 관리됨)
      const tokens = { idToken: 'temp-token' };
      onAuthComplete(userWithMode, tokens);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </SafeAreaView>
    );
  }

  // 사용자가 로그인했지만 모드를 선택하지 않은 경우
  if (user && !user.mode) {
    return (
      <ModeSelectionScreen 
        user={user} 
        onModeSelected={handleModeSelected} 
      />
    );
  }

  // 로그인하지 않은 경우
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>FitGrow</Text>
        <Text style={styles.subtitle}>학생 건강체력 관리 앱</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>🏃‍♂️</Text>
        </View>
        
        <Text style={styles.welcomeTitle}>건강한 성장을{'\n'}함께 기록해보세요</Text>
        
        <Text style={styles.description}>
          PAPS 체력검사 결과와 일상 활동을 기록하고{'\n'}
          개인별 맞춤 분석을 받아보세요
        </Text>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>✨ 주요 기능</Text>
          <Text style={styles.featureItem}>📊 PAPS 체력검사 기록 관리</Text>
          <Text style={styles.featureItem}>📅 일상 운동 활동 기록</Text>
          <Text style={styles.featureItem}>📈 성장 추이 분석 차트</Text>
          <Text style={styles.featureItem}>🎯 맞춤형 운동 추천</Text>
        </View>

        <GoogleSignInButton
          onSignInSuccess={handleSignInSuccess}
          onSignInError={handleSignInError}
          loading={signingIn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconEmoji: {
    fontSize: 80,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 15,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#5f6368',
    marginBottom: 40,
    lineHeight: 22,
  },
  featuresContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  featureItem: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default AuthScreen;