package com.example.tbs.dto;

import lombok.Data;

public class AuthDTO {

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String email;
        private String fullName;
    }

    @Data
    public static class AuthResponse {
        private Long userId;
        private String username;
        private String role;

        public AuthResponse(Long userId, String username, String role) {
            this.userId = userId;
            this.username = username;
            this.role = role;
        }
    }
}
