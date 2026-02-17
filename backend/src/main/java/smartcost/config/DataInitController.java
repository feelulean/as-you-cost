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

@RestController
@RequestMapping("/init")
public class DataInitController {

    @Inject
    private DataSource dataSource;

    @RequestMapping("/master-data")
    public Map<String, Object> initMasterData() {
        return executeSqlFile("init/master-init.sql", "기준정보 마스터 데이터 초기화 완료");
    }

    @RequestMapping("/sample-data")
    public Map<String, Object> initSampleData() {
        return executeSqlFile("init/sample-data.sql", "샘플 데이터 초기화 완료 (SEAT 3건 + PT 3건)");
    }

    @RequestMapping("/estimate-detail")
    public Map<String, Object> initEstimateDetail() {
        return executeSqlFile("init/estimate-detail-init.sql", "견적원가 상세 테이블 초기화 완료 (18 Tables)");
    }

    @RequestMapping("/tc-cc-detail")
    public Map<String, Object> initTcCcDetail() {
        return executeSqlFile("init/tc-cc-detail-init.sql", "목표원가/현상원가 상세 테이블 초기화 완료 (31 Tables)");
    }

    @RequestMapping("/excel-master-data")
    public Map<String, Object> initExcelMasterData() {
        return executeSqlFile("init/excel-master-data.sql", "기준정보 Excel 데이터 Import 완료");
    }

    @RequestMapping("/add-base-currency")
    public Map<String, Object> addBaseCurrency() {
        return executeSqlFile("init/add-base-currency.sql", "BASE_CURRENCY 칼럼 추가 완료 (3 Tables)");
    }

    private Map<String, Object> executeSqlFile(String resourcePath, String successMessage) {
        Map<String, Object> result = new HashMap<>();

        try {
            InputStream is = getClass().getClassLoader()
                    .getResourceAsStream(resourcePath);

            if (is == null) {
                result.put("resultStatus", "FAIL");
                result.put("message", resourcePath + " 파일을 찾을 수 없습니다.");
                return result;
            }

            String sql = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            is.close();

            String[] statements = sql.split(";");
            int executed = 0;
            int skipped = 0;

            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {

                for (String s : statements) {
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
            result.put("message", successMessage);

        } catch (Exception e) {
            result.put("resultStatus", "FAIL");
            result.put("message", e.getMessage());
            e.printStackTrace();
        }

        return result;
    }
}
