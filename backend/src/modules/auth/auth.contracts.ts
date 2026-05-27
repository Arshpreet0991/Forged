// request interfaces for auth module

interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
}

// response interfaces for auth module
interface RegisterResponse {
  userId: string;
  email: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    avatar: string | null;
  };
}

interface VerifyEmailResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    avatar: string | null;
  };
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordResponse {
  message: string;
}

export {
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RegisterResponse,
  LoginResponse,
  VerifyEmailResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
};
