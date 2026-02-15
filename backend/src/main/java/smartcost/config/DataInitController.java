package smartcost.config;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;
import javax.sql.DataSource;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 샘플 데이터 초기화 Controller (개발/테스트 전용)
 *
 * - /init/sample-data 호출 시 sample-data.sql 스크립트를 실행한다.
 * - 운영 환경에서는 비활성화 또는 삭제할 것.
 */
@RestController
@RequestMapping("/init")
public class DataInitController {

    @Inject
    private DataSource dataSource;

    @RequestMapping("/sample-data")
    public Map<String, Object> initSampleData() {
        Map<String, Object> result = new HashMap<>();

        try {
            // SQL 파일 로드
            InputStream is = getClass().getClassLoader()
                    .getResourceAsStream("init/sample-data.sql");

            if (is == null) {
                result.put("resultStatus", "FAIL");
                result.put("message", "sample-data.sql 파일을 찾을 수 없습니다.");
                return result;
            }

            String sql = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            is.close();

            // 주석 제거 및 구문 분리
            String[] statements = sql.split(";");
            int executed = 0;
            int skipped = 0;

            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {

                for (String s : statements) {
                    // 주석과 빈 줄 제거
                    String trimmed = s.replaceAll("--[^\n]*", "").trim();
                    if (trimmed.isEmpty()) {
                        skipped++;
                        continue;
                    }

                    stmt.execute(trimmed);
                    executed++;
                }
            }

            result.put("resultStatus", "SUCCESS");
            result.put("executedStatements", executed);
            result.put("skippedStatements", skipped);
            result.put("message", "샘플 데이터 초기화 완료 (SEAT 3건 + PT 3건)");

        } catch (Exception e) {
            result.put("resultStatus", "FAIL");
            result.put("message", e.getMessage());
            e.printStackTrace();
        }

        return result;
    }
}
