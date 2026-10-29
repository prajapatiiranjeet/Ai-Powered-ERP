package com.chaiorcode.mycode;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MycodeApplication {

	public static void main(String[] args) {
		// Spring Boot app start hote hi:
		// 1) Component scan hota hai (controllers/services/repos/config)
		// 2) DataSource/JPA initialize hota hai
		// 3) SecurityFilterChain register hoti hai (JWT filter included)
		SpringApplication.run(MycodeApplication.class, args);
	}

}
