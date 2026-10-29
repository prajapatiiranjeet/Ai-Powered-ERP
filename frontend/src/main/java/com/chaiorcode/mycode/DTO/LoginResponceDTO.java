package com.chaiorcode.mycode.DTO;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponceDTO {
  // login krne ke baaadye cheeze return kri jyengi
    // id: DB me user ka unique id
    // jwt: ye token client ko milega aur next requests me Authorization header me aayega
    private Long id;
    private String jwt;
    private String role;
    private String name;
    private String email;

    public LoginResponceDTO(Long id, String jwt) {
        this.id = id;
        this.jwt = jwt;
    }
}
