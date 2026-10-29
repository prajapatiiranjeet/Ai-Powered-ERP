package com.chaiorcode.mycode.DTO;

import com.chaiorcode.mycode.Enum.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminUserOptionDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
}
