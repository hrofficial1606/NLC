package com.nlc.backend.service.impl;

import com.nlc.backend.dto.auth.AuthResponse;
import com.nlc.backend.dto.auth.ForgotPasswordRequest;
import com.nlc.backend.dto.auth.LoginRequest;
import com.nlc.backend.dto.auth.RefreshTokenRequest;
import com.nlc.backend.dto.auth.RegisterRequest;
import com.nlc.backend.dto.auth.ResetPasswordRequest;
import com.nlc.backend.entity.PasswordResetToken;
import com.nlc.backend.entity.RefreshToken;
import com.nlc.backend.entity.Role;
import com.nlc.backend.entity.User;
import com.nlc.backend.entity.VerificationToken;
import com.nlc.backend.entity.enums.AuthProvider;
import com.nlc.backend.entity.enums.RoleType;
import com.nlc.backend.exception.BadRequestException;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.exception.UnauthorizedException;
import com.nlc.backend.repository.PasswordResetTokenRepository;
import com.nlc.backend.repository.RefreshTokenRepository;
import com.nlc.backend.repository.RoleRepository;
import com.nlc.backend.repository.UserRepository;
import com.nlc.backend.repository.VerificationTokenRepository;
import com.nlc.backend.security.JwtService;
import com.nlc.backend.security.UserPrincipal;
import com.nlc.backend.service.AuthService;
import com.nlc.backend.service.EmailService;
import com.nlc.backend.service.NotificationService;
import com.nlc.backend.service.WhatsAppService;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final WhatsAppService whatsAppService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email already registered");
        }

        Role userRole = roleRepository.findByName(RoleType.USER)
                .orElseThrow(() -> new ResourceNotFoundException("Default USER role not found"));

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email().toLowerCase());
        user.setPhoneNumber(request.phoneNumber());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setCity(request.city());
        user.setProfession(request.profession());
        user.setInstagramProfile(request.instagramProfile());
        user.setProvider(AuthProvider.LOCAL);
        user.setRoles(Set.of(userRole));
        userRepository.save(user);

        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationToken.setExpiresAt(LocalDateTime.now().plusDays(1));
        verificationToken.setUser(user);
        verificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(user.getEmail(), verificationToken.getToken());
        notificationService.notifyUser(user.getId(), "Registration successful",
                "Welcome to Nagpur Ladies Club. Please verify your email to activate your account.", "USER_REGISTERED");
        whatsAppService.sendRegistrationConfirmation(user);

        return issueTokens(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        return issueTokens(user);
    }

    @Override
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));
        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }
        User user = refreshToken.getUser();
        return issueTokens(user);
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(LocalDateTime.now().plusHours(2));
        token.setUser(user);
        passwordResetTokenRepository.save(token);
        emailService.sendPasswordResetEmail(user.getEmail(), token.getToken());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new ResourceNotFoundException("Reset token not found"));
        if (token.isUsed() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token is invalid or expired");
        }
        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Verification token not found"));
        if (verificationToken.isUsed() || verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification token is invalid or expired");
        }
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);
    }

    private AuthResponse issueTokens(User user) {
        UserPrincipal principal = UserPrincipal.from(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshTokenValue = jwtService.generateRefreshToken(principal);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(14));
        refreshToken.setUser(user);
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()),
                accessToken,
                refreshTokenValue,
                jwtService.getAccessTokenExpiry()
        );
    }
}
