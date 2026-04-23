export interface SignupRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface AuthResponse {
  message?: string;
  user_id?: string;
  name?: string;
}
