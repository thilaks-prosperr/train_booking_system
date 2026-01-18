/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.example.tbs.dto;

import lombok.Data;

public class AuthDto {
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
        private String token;
        private String role;
        private Long userId;

        public AuthResponse(String token, String role, Long userId) {
            this.token = token;
            this.role = role;
            this.userId = userId;
        }
    }
}
