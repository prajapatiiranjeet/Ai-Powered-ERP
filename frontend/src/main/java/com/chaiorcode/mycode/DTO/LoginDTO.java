package com.chaiorcode.mycode.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDTO {
    // ye dono cheeze chahiye login krne ke liye
    // Email ko username ki tarah treat kiya gaya hai poori app me.
    private String email;
    private String password;
}
