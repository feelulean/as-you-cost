package smartcost.config;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * 글로벌 파라미터 자동 래핑 AOP
 *
 * As-You-Cost 플랫폼의 글로벌 컨텍스트(#{g.tenant}, #{g.username}, #{g.now})를
 * 모든 Repository 호출 시 자동으로 주입한다.
 *
 * ─ 변환 전 (Service → Repository) ─
 *   { "ecPjtCd": "EC20260001", "itemCd": "P001" }
 *
 * ─ 변환 후 (Repository → MyBatis) ─
 *   {
 *     "g": { "tenant": "T001", "username": "testuser", "now": Timestamp },
 *     "p": { "ecPjtCd": "EC20260001", "itemCd": "P001" }
 *   }
 */
@Aspect
@Component
public class GlobalParamAspect {

    /** 테스트용 테넌트 ID */
    private static final String TENANT = "T001";

    /** 테스트용 사용자 ID */
    private static final String USERNAME = "testuser";

    /**
     * 모든 Repository 메서드 호출 시 Map 파라미터를 g/p 구조로 래핑
     */
    @Around("execution(* smartcost.app.bp..*Repository.*(..))")
    @SuppressWarnings("unchecked")
    public Object wrapGlobalParam(ProceedingJoinPoint pjp) throws Throwable {
        Object[] args = pjp.getArgs();

        if (args.length > 0 && args[0] instanceof Map) {
            Map<String, Object> original = (Map<String, Object>) args[0];

            // 이미 래핑된 경우 (g/p 키 존재) 중복 래핑 방지
            if (original.containsKey("g") && original.containsKey("p")) {
                return pjp.proceed(args);
            }

            // 글로벌 컨텍스트 구성
            Map<String, Object> global = new HashMap<>();
            global.put("tenant", TENANT);
            global.put("username", USERNAME);
            global.put("now", new Timestamp(System.currentTimeMillis()));

            // g/p 구조로 래핑
            Map<String, Object> wrapped = new HashMap<>();
            wrapped.put("g", global);
            wrapped.put("p", original);

            args[0] = wrapped;
        }

        return pjp.proceed(args);
    }
}
