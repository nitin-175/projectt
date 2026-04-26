package com.showbooking.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.google")
public record GoogleOAuthProperties(
    String clientId,
    String clientSecret,
    String redirectUri,
    String frontendSuccessUrl
) {
}
