package com.example.WebHocTap.config;

import com.example.WebHocTap.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {
                })
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // Courses & Lessons: GET is accessible to all authenticated users
                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/lessons/**").authenticated()

                        // Courses & Lessons: CUD (Create/Update/Delete) requires ADMIN or TEACHER
                        .requestMatchers(HttpMethod.POST, "/api/v1/courses/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/courses/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/courses/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/lessons/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/lessons/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/lessons/**").hasAnyRole("ADMIN", "TEACHER")

                        // User management: ADMIN only
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")

                        // Everything else requires authentication
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
