package com.jwt.service;

import com.jwt.dto.LoginRequest;
import com.jwt.dto.LoginResponse;
import com.jwt.dto.RegisterRequest;
import com.jwt.dto.UserDTO;
import com.jwt.entity.User;
import com.jwt.provider.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final UserService userService;
    private final JwtProvider jwtProvider;

    /**
     * Registra un nuevo usuario
     * @throws RuntimeException si el email o username ya existe o si las contraseñas no coinciden
     */
    public User register(RegisterRequest request) {
        // Validar que las contraseñas coincidan
        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            throw new RuntimeException("Las contraseñas no coinciden");
        }

        // Validar que el email no exista
        if (userService.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // Validar que el username no exista
        if (userService.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya está registrado");
        }

        // Crear el usuario
        return userService.createUser(
            request.getUsername(),
            request.getEmail(),
            request.getPassword()
        );
    }

    /**
     * Autentica un usuario y retorna access token y refresh token
     * @throws RuntimeException si el usuario no existe o la contraseña es incorrecta
     */
    public LoginResponse login(LoginRequest request) {
        // Buscar el usuario por email
        User user = userService.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar la contraseña
        if (!userService.checkPassword(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        // Generar tokens
        String accessToken = jwtProvider.generateAccessToken(user.getId(), user.getUsername(), user.getEmail());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId(), user.getUsername(), user.getEmail());

        // Crear y retornar respuesta
        UserDTO userDTO = new UserDTO(user.getId(), user.getUsername(), user.getEmail());
        return new LoginResponse(
            accessToken,
            refreshToken,
            jwtProvider.getAccessTokenExpiration() / 1000, // Convertir a segundos
            jwtProvider.getTokenType(),
            userDTO
        );
    }

    /**
     * Renueva el access token usando un refresh token
     * @throws RuntimeException si el refresh token no es válido
     */
    public LoginResponse refreshAccessToken(String refreshToken) {
        // Validar el refresh token
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Refresh token inválido o expirado");
        }

        // Extraer información del token
        Long userId = jwtProvider.extractUserId(refreshToken);
        String username = jwtProvider.extractUsername(refreshToken);
        String email = jwtProvider.extractEmail(refreshToken);

        // Generar nuevo access token
        String newAccessToken = jwtProvider.generateAccessToken(userId, username, email);

        // Buscar el usuario para retornar sus datos
        User user = userService.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UserDTO userDTO = new UserDTO(user.getId(), user.getUsername(), user.getEmail());
        return new LoginResponse(
            newAccessToken,
            refreshToken,
            jwtProvider.getAccessTokenExpiration() / 1000,
            jwtProvider.getTokenType(),
            userDTO
        );
    }

}
