package com.chaiorcode.mycode.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProfileUpdateRequest {
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private Integer semester;
    private String specialization;
}
