package com.chaiorcode.mycode.Controller;


import com.chaiorcode.mycode.DTO.CreateUserDto;
import com.chaiorcode.mycode.DTO.LoginDTO;
import com.chaiorcode.mycode.DTO.LoginResponceDTO;
import com.chaiorcode.mycode.DTO.RegisterDTO;
import com.chaiorcode.mycode.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {


    private  final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponceDTO> login(@RequestBody LoginDTO loginDTO){
             // Login ka main output JWT token hai.
             // Client is token ko next requests me Authorization header me Bearer token ke form me bhejega.
             return ResponseEntity.status(HttpStatus.OK).body((authService.login(loginDTO)));
    }


}
