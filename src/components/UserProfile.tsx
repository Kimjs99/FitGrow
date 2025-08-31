import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuthStore, useAuth } from '../stores/authStore';
import AuthService from '../services/authService';

interface UserProfileProps {
  showModeChange?: boolean;
  onModeChange?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  showModeChange = true, 
  onModeChange 
}) => {
  const { user, selectedMode } = useAuth();
  const { signOut, setMode, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const authService = AuthService.getInstance();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const success = await authService.signOut();
      if (success) {
        signOut();
        Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
      } else {
        Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setShowSignOutConfirm(false);
    }
  };

  const handleModeChange = async (newMode: 'student' | 'teacher') => {
    if (newMode === selectedMode) {
      setShowModeModal(false);
      return;
    }

    setIsLoading(true);
    try {
      const success = await authService.setUserMode(newMode);
      if (success) {
        setMode(newMode);
        updateUser({ mode: newMode });
        Alert.alert(
          '모드 변경 완료',
          `${newMode === 'student' ? '학생' : '교사'} 모드로 변경되었습니다.`
        );
        onModeChange && onModeChange();
      } else {
        Alert.alert('오류', '모드 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Mode change error:', error);
      Alert.alert('오류', '모드 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setShowModeModal(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>사용자 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 사용자 기본 정보 */}
      <View style={styles.userInfoContainer}>
        {user.photo && (
          <Image source={{ uri: user.photo }} style={styles.profileImage} />
        )}
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.modeContainer}>
            <Text style={styles.modeLabel}>현재 모드:</Text>
            <View style={[
              styles.modeBadge,
              selectedMode === 'student' ? styles.studentBadge : styles.teacherBadge
            ]}>
              <Text style={styles.modeText}>
                {selectedMode === 'student' ? '🎒 학생' : '👩‍🏫 교사'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 액션 버튼들 */}
      <View style={styles.actionsContainer}>
        {showModeChange && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowModeModal(true)}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>모드 변경</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.signOutButton]}
          onPress={() => setShowSignOutConfirm(true)}
          disabled={isLoading}
        >
          <Text style={[styles.actionButtonText, styles.signOutText]}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {/* 모드 변경 모달 */}
      <Modal
        visible={showModeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>모드 선택</Text>
            <Text style={styles.modalSubtitle}>
              어떤 모드로 변경하시겠습니까?
            </Text>

            <View style={styles.modeOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.modeOption,
                  selectedMode === 'student' && styles.currentModeOption
                ]}
                onPress={() => handleModeChange('student')}
                disabled={isLoading}
              >
                <Text style={styles.modeOptionEmoji}>🎒</Text>
                <Text style={styles.modeOptionText}>학생 모드</Text>
                {selectedMode === 'student' && (
                  <Text style={styles.currentModeIndicator}>현재</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeOption,
                  selectedMode === 'teacher' && styles.currentModeOption
                ]}
                onPress={() => handleModeChange('teacher')}
                disabled={isLoading}
              >
                <Text style={styles.modeOptionEmoji}>👩‍🏫</Text>
                <Text style={styles.modeOptionText}>교사 모드</Text>
                {selectedMode === 'teacher' && (
                  <Text style={styles.currentModeIndicator}>현재</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowModeModal(false)}
              disabled={isLoading}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>

            {isLoading && (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="small" color="#3498db" />
                <Text style={styles.modalLoadingText}>변경 중...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 로그아웃 확인 모달 */}
      <Modal
        visible={showSignOutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>로그아웃</Text>
            <Text style={styles.modalSubtitle}>
              정말로 로그아웃하시겠습니까?
            </Text>

            <View style={styles.confirmButtonsContainer}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={() => setShowSignOutConfirm(false)}
                disabled={isLoading}
              >
                <Text style={styles.confirmCancelText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmSignOutButton}
                onPress={handleSignOut}
                disabled={isLoading}
              >
                <Text style={styles.confirmSignOutText}>로그아웃</Text>
              </TouchableOpacity>
            </View>

            {isLoading && (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="small" color="#e74c3c" />
                <Text style={styles.modalLoadingText}>로그아웃 중...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#3498db',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 8,
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  studentBadge: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  teacherBadge: {
    backgroundColor: '#fce4ec',
    borderWidth: 1,
    borderColor: '#e91e63',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutText: {
    color: '#ffffff',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  modeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  currentModeOption: {
    borderColor: '#3498db',
    backgroundColor: '#f8fcff',
  },
  modeOptionEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  modeOptionText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  currentModeIndicator: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 4,
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#6c757d',
  },
  modalCancelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  modalLoadingText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
  },
  
  // 확인 모달 스타일
  confirmButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    marginRight: 8,
    alignItems: 'center',
  },
  confirmSignOutButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmCancelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmSignOutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UserProfile;