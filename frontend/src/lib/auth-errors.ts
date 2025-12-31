// Firebase Auth Error Codes và Messages
export const FIREBASE_AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'Email này đã được sử dụng.',
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được kích hoạt.',
  'auth/weak-password': 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.',
  'auth/user-disabled': 'Tài khoản này đã bị vô hiệu hóa.',
  'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
  'auth/wrong-password': 'Mật khẩu không chính xác.',
  'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.',
  'auth/too-many-requests': 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau.',
  'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.',
  'auth/popup-closed-by-user': 'Cửa sổ đăng nhập đã bị đóng.',
  'auth/cancelled-popup-request': 'Yêu cầu đăng nhập đã bị hủy.',
  'auth/account-exists-with-different-credential': 'Email này đã được sử dụng với phương thức đăng nhập khác.',
};

// Generic error messages
export const GENERIC_ERRORS = {
  BACKEND_LOGIN_FAILED: 'Không thể xác thực với hệ thống. Vui lòng thử lại.',
  NETWORK_ERROR: 'Lỗi kết nối. Vui lòng kiểm tra internet.',
  UNKNOWN_ERROR: 'Có lỗi xảy ra. Vui lòng thử lại.',
  PASSWORDS_DO_NOT_MATCH: 'Mật khẩu không khớp.',
} as const;

/**
 * Parse Firebase Auth Error to Vietnamese message
 */
export function getFirebaseErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    return FIREBASE_AUTH_ERRORS[code] || GENERIC_ERRORS.UNKNOWN_ERROR;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return GENERIC_ERRORS.UNKNOWN_ERROR;
}
