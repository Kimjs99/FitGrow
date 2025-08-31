// API 설정 파일
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3001'  // 개발 환경
    : 'https://your-production-server.com',  // 프로덕션 환경
    
  TIMEOUT: 10000, // 10초 타임아웃
  
  // 엔드포인트들
  ENDPOINTS: {
    // 인증 관련
    AUTH: {
      GOOGLE_LOGIN: '/api/auth/google',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      PROFILE: '/api/auth/profile',
      VALIDATE: '/api/auth/validate',
    },
    
    // 학생 모드 전용
    STUDENT: {
      PROFILE: '/api/student/profile',
      PAPS: '/api/student/paps',
      ACTIVITIES: '/api/student/activities',
      DASHBOARD: '/api/student/dashboard',
    },
    
    // 교사 모드 전용
    TEACHER: {
      PROFILE: '/api/teacher/profile',
      TEMPLATE: '/api/teacher/template',
      DISTRIBUTE: '/api/teacher/distribute',
      CLASS_STATS: '/api/teacher/class-stats',
      STUDENT_REPORT: '/api/teacher/student-report',
    },
    
    // Google Sheets
    SHEETS: {
      INFO: '/api/sheets/info',
      READ: '/api/sheets/read',
      WRITE: '/api/sheets/write',
      APPEND: '/api/sheets/append',
    },
    
    // 시스템
    HEALTH: '/health',
  }
};

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// 에러 코드 정의
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_FAILED: 'AUTH_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INVALID_MODE: 'INVALID_MODE',
  GOOGLE_SHEETS_ERROR: 'GOOGLE_SHEETS_ERROR',
};