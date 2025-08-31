import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  GoogleSigninButton,
  GoogleSignin,
} from '@react-native-google-signin/google-signin';
import AuthService, { User } from '../services/authService';

interface Props {
  onSignInSuccess: (result: { user: User; tokens: { idToken: string; refreshToken?: string } }) => void;
  onSignInError: (error: string) => void;
  loading?: boolean;
}

const GoogleSignInButtonComponent: React.FC<Props> = ({
  onSignInSuccess,
  onSignInError,
  loading = false,
}) => {
  const authService = AuthService.getInstance();

  const handleSignIn = async () => {
    try {
      const result = await authService.signIn();
      if (result) {
        onSignInSuccess(result);
      } else {
        onSignInError('로그인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Sign in failed:', error);
      onSignInError(error.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285f4" />
        <Text style={styles.loadingText}>로그인 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GoogleSigninButton
        style={styles.googleButton}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleSignIn}
      />
      
      <Text style={styles.infoText}>
        Google 계정으로 로그인하면 개인 구글 드라이브에{'\n'}
        안전하게 데이터가 저장됩니다.
      </Text>
      
      <Text style={styles.privacyText}>
        • 앱은 사용자가 생성한 파일에만 접근합니다{'\n'}
        • 개인정보는 안전하게 보호됩니다{'\n'}
        • 언제든지 계정 연동을 해제할 수 있습니다
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  googleButton: {
    width: 250,
    height: 48,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
    lineHeight: 20,
  },
  privacyText: {
    fontSize: 12,
    textAlign: 'left',
    color: '#666',
    lineHeight: 18,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4285f4',
  },
});

export default GoogleSignInButtonComponent;