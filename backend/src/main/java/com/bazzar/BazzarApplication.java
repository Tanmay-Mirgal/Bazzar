package com.bazzar;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BazzarApplication {

    public static void main(String[] args) {
        // Load .env file and set as system properties before Spring context loads
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")
                    .ignoreIfMissing()
                    .load();
            dotenv.entries().forEach(entry ->
                    System.setProperty(entry.getKey(), entry.getValue())
            );
        } catch (Exception e) {
            // .env not found – rely on real environment variables
        }

        SpringApplication.run(BazzarApplication.class, args);
    }
}
