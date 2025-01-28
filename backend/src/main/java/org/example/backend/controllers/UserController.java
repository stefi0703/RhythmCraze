package org.example.backend.controllers;

import org.example.backend.domain.User;
import org.example.backend.dto.UserDto;
import org.example.backend.security.JwtUtil;
import org.example.backend.security.UserRepoUserDetailsService;
import org.example.backend.services.impl.UserServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/users")
public class UserController {

    private final JwtUtil jwtUtil;
    private final UserRepoUserDetailsService userDetailsService;
    private final UserServiceImpl userService;

    public UserController(JwtUtil jwtUtil, UserRepoUserDetailsService userDetailsService, UserServiceImpl userService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDto user) {

        User authenticated = userDetailsService.checkUserCredentials(user.getUsername(), user.getPassword());
        if (authenticated != null) {
            String jwtToken = jwtUtil.generateToken(user.getUsername());
            System.out.println("Generated Token: " + jwtToken);
            return ResponseEntity.ok(jwtToken);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDto userDto) {
        try {
            User registeredUser = userDetailsService.register(userDto);
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to register user: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UserDto userDto, @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7)); // Remove "Bearer " prefix
            User user = userService.findByUsername(username);

            if (user != null) {
                user.setFirstName(userDto.getFirstName());
                user.setLastName(userDto.getLastName());
                user.setEmail(userDto.getEmail());
                userService.save(user);

                // Return a JSON response
                return ResponseEntity.ok(Map.of("message", "User updated successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to update user", "error", e.getMessage()));
        }
    }


    @GetMapping("/details")
    public ResponseEntity<?> getUserDetails(@RequestParam String username) {
        User user = userService.findByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
}
