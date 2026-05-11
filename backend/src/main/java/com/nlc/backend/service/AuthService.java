package com.nlc.backend.service;

import com.nlc.backend.dto.auth.AuthResponse;
import com.nlc.backend.dto.auth.ForgotPasswordRequest;
import com.nlc.backend.dto.auth.LoginRequest;
import com.nlc.backend.dto.auth.RefreshTokenRequest;
import com.nlc.backend.dto.auth.RegisterRequest;
import com.nlc.backend.dto.auth.ResetPasswordRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshTokenRequest request);
    void logout(String refreshToken);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void verifyEmail(String token);
}
