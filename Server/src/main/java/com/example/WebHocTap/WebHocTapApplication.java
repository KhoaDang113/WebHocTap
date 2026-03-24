package com.example.WebHocTap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WebHocTapApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebHocTapApplication.class, args);
	}

}
