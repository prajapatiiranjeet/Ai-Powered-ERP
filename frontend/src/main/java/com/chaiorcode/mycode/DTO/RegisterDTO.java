package com.chaiorcode.mycode.DTO;


import com.chaiorcode.mycode.Enum.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RegisterDTO {

    // Register response me minimal info return kar rahe hai,
    // taaki frontend ko confirm ho jaye ki user create ho gaya hai.
    private Long id;
    private String name ;
    @NotNull
    private Role role;

}
