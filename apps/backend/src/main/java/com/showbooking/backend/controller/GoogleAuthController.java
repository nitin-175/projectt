package com.showbooking.backend.controller;

import com.showbooking.backend.config.GoogleOAuthProperties;
import com.showbooking.backend.dto.auth.AuthResponse;
import com.showbooking.backend.dto.auth.GoogleTokenResponse;
import com.showbooking.backend.dto.auth.GoogleUserInfoResponse;
import com.showbooking.backend.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/auth/google")
public class GoogleAuthController {

    private static final String STATE_COOKIE = "stagepass_google_state";
    private static final String GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

    private final GoogleOAuthProperties googleOAuthProperties;
    private final AuthService authService;
    private final RestClient restClient;

    public GoogleAuthController(GoogleOAuthProperties googleOAuthProperties, AuthService authService) {
        this.googleOAuthProperties = googleOAuthProperties;
        this.authService = authService;
        this.restClient = RestClient.builder().build();
    }

    @GetMapping
    public org.springframework.http.ResponseEntity<Void> startGoogleAuth() {
        ensureGoogleConfigured();
        String state = UUID.randomUUID().toString();
        ResponseCookie cookie = ResponseCookie.from(STATE_COOKIE, state)
            .httpOnly(true)
            .secure(false)
            .sameSite("Lax")
            .path("/")
            .maxAge(Duration.ofMinutes(10))
            .build();

        String location = GOOGLE_AUTH_ENDPOINT
            + "?client_id=" + encode(googleOAuthProperties.clientId())
            + "&redirect_uri=" + encode(googleOAuthProperties.redirectUri())
            + "&response_type=code"
            + "&scope=" + encode("openid email profile")
            + "&state=" + encode(state)
            + "&access_type=offline"
            + "&prompt=" + encode("consent");

        return org.springframework.http.ResponseEntity.status(302)
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .location(URI.create(location))
            .build();
    }

    @GetMapping("/callback")
    public org.springframework.http.ResponseEntity<Void> handleGoogleCallback(
        @RequestParam(value = "code", required = false) String code,
        @RequestParam(value = "state", required = false) String state,
        @RequestParam(value = "error", required = false) String error,
        @org.springframework.web.bind.annotation.CookieValue(value = STATE_COOKIE, required = false) String stateCookie
    ) {
        ensureGoogleConfigured();
        ResponseCookie clearCookie = ResponseCookie.from(STATE_COOKIE, "")
            .httpOnly(true)
            .secure(false)
            .sameSite("Lax")
            .path("/")
            .maxAge(Duration.ZERO)
            .build();

        if (error != null && !error.isBlank()) {
            return redirectWithCookie(googleOAuthProperties.frontendSuccessUrl() + "?error=" + encode("Google sign-in was canceled"), clearCookie);
        }
        if (code == null || code.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Missing Google authorization code");
        }
        if (state == null || stateCookie == null || !state.equals(stateCookie)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid Google OAuth state");
        }

        GoogleTokenResponse tokenResponse = exchangeCodeForToken(code);
        GoogleUserInfoResponse googleUser = fetchGoogleUser(tokenResponse.accessToken());
        AuthResponse authResponse = authService.loginWithGoogle(googleUser);

        String redirectUrl = googleOAuthProperties.frontendSuccessUrl()
            + "?token=" + encode(authResponse.token())
            + "&name=" + encode(authResponse.name())
            + "&email=" + encode(authResponse.email())
            + authResponse.roles().stream().map(role -> "&roles=" + encode(role)).reduce("", String::concat)
            + authResponse.venueIds().stream().map(venueId -> "&venueIds=" + venueId).reduce("", String::concat);

        return redirectWithCookie(redirectUrl, clearCookie);
    }

    private GoogleTokenResponse exchangeCodeForToken(String code) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("code", code);
        formData.add("client_id", googleOAuthProperties.clientId());
        formData.add("client_secret", googleOAuthProperties.clientSecret());
        formData.add("redirect_uri", googleOAuthProperties.redirectUri());
        formData.add("grant_type", "authorization_code");

        return restClient.post()
            .uri(GOOGLE_TOKEN_ENDPOINT)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(formData)
            .retrieve()
            .body(GoogleTokenResponse.class);
    }

    private GoogleUserInfoResponse fetchGoogleUser(String accessToken) {
        return restClient.get()
            .uri(GOOGLE_USERINFO_ENDPOINT)
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
            .retrieve()
            .body(GoogleUserInfoResponse.class);
    }

    private void ensureGoogleConfigured() {
        if (isBlank(googleOAuthProperties.clientId()) || isBlank(googleOAuthProperties.clientSecret())) {
            throw new ResponseStatusException(BAD_REQUEST, "Google OAuth is not configured on the backend");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String encode(String value) {
        return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private org.springframework.http.ResponseEntity<Void> redirectWithCookie(String location, ResponseCookie cookie) {
        return org.springframework.http.ResponseEntity.status(302)
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .location(URI.create(location))
            .build();
    }
}
