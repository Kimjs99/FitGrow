import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AuthService, { User } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

interface Props {
  user: User;
  onModeSelected: (user: User) => void;
}

const ModeSelectionScreen: React.FC<Props> = ({ user, onModeSelected }) => {
  const [selectedMode, setSelectedMode] = useState<'student' | 'teacher' | null>(null);
  const [loading, setLoading] = useState(false);
  
  const authService = AuthService.getInstance();
  const { setMode, updateUser } = useAuthStore();

  const handleModeSelection = async (mode: 'student' | 'teacher') => {
    if (loading) return;
    
    setLoading(true);
    setSelectedMode(mode);
    
    try {
      // AuthService를 통해 모드 설정 (백엔드와 동기화)
      const success = await authService.setUserMode(mode);
      
      if (success) {
        // Zustand 스토어 업데이트
        setMode(mode);
        updateUser({ mode });
        
        // 업데이트된 사용자 정보 가져오기
        const updatedUser = await authService.getCurrentUser();
        if (updatedUser) {
          onModeSelected(updatedUser);
        }
        
        // 성공 메시지
        Alert.alert(
          '모드 선택 완료',
          `${mode === 'student' ? '학생' : '교사'} 모드로 설정되었습니다.`,
          [{ text: '확인' }]
        );
      } else {
        Alert.alert('오류', '모드 설정에 실패했습니다.');
        setSelectedMode(null);
      }
    } catch (error) {
      console.error('Mode selection error:', error);
      Alert.alert('오류', '모드 설정 중 오류가 발생했습니다.');
      setSelectedMode(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>환영합니다!</Text>
        <Text style={styles.nameText}>{user.name}님</Text>
        <Text style={styles.emailText}>{user.email}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.titleText}>
          어떤 모드로 FitGrow를{'\n'}사용하시겠습니까?
        </Text>

        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              selectedMode === 'student' && styles.selectedMode,
            ]}
            onPress={() => {
              setSelectedMode('student');
              handleModeSelection('student');
            }}
            disabled={loading}
          >
            <View style={styles.modeIcon}>
              <Text style={styles.modeEmoji}>🎓</Text>
            </View>
            <Text style={styles.modeTitle}>학생 모드</Text>
            <Text style={styles.modeDescription}>
              • 개인 PAPS 기록 관리{'\n'}
              • 신체활동 일지 작성{'\n'}
              • 성장 추이 분석{'\n'}
              • 개인별 피드백 받기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              selectedMode === 'teacher' && styles.selectedMode,
            ]}
            onPress={() => {
              setSelectedMode('teacher');
              handleModeSelection('teacher');
            }}
            disabled={loading}
          >
            <View style={styles.modeIcon}>
              <Text style={styles.modeEmoji}>👩‍🏫</Text>
            </View>
            <Text style={styles.modeTitle}>교사 모드</Text>
            <Text style={styles.modeDescription}>
              • 학급 학생 관리{'\n'}
              • PAPS 데이터 일괄 업로드{'\n'}
              • 학급 전체 분석{'\n'}
              • 개별 학생 성장 조회
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.noteText}>
          * 나중에 설정에서 모드를 변경할 수 있습니다.
        </Text>

        {/* 로딩 오버레이 */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text style={styles.loadingText}>
                {selectedMode === 'student' ? '학생' : '교사'} 모드로 설정하는 중...
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 40,
    lineHeight: 30,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  modeButton: {
    flex: 0.47,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMode: {
    borderColor: '#3498db',
    backgroundColor: '#f8fcff',
  },
  modeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  modeEmoji: {
    fontSize: 30,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  modeDescription: {
    fontSize: 13,
    color: '#5f6368',
    textAlign: 'center',
    lineHeight: 18,
  },
  noteText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default ModeSelectionScreen;