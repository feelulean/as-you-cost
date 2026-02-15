package smartcost;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

/**
 * As-You-Cost 애플리케이션 진입점
 *
 * - Spring Boot 2.7.18 내장 Tomcat으로 독립 실행
 * - DataSource는 DatabaseConfig에서 수동 구성 (Auto-Config 제외)
 * - 기본 포트: 8080
 */
@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
