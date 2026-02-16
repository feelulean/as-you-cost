package smartcost.app.bp.cost.currentcost;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 현상원가 프로젝트 관리 Service
 *
 * - 현상원가(Current Cost) 프로젝트의 비즈니스 로직을 처리한다.
 * - 견적원가(EC)에서 이관 → 현상차수(ccRev) 관리 → 진행상태(progSts) 제어
 * - 진행상태 흐름: D(Draft) → P(진행중) → A(확정) → C(완료)
 */
@Service
public class CurrentCostService {

    @Inject
    private CurrentCostRepository currentCostRepository;

    /**
     * 현상원가 프로젝트 목록 조회
     *
     * @param param 조회 조건 (pjtCd, bizUnit, custNm, carType)
     * @return 프로젝트 목록
     */
    public List<Map<String, Object>> findListCurrentCostPjt(Map<String, Object> param) {
        return currentCostRepository.findListCurrentCostPjt(param);
    }

    /**
     * 현상원가 프로젝트 단건 조회
     *
     * @param param 조회 조건 (pjtCd, ccRev)
     * @return 프로젝트 정보 (단건)
     */
    public Map<String, Object> findCurrentCostPjt(Map<String, Object> param) {
        Map<String, Object> result = currentCostRepository.findCurrentCostPjt(param);
        if (result == null) result = new HashMap<>();
        return result;
    }

    /**
     * 현상원가 프로젝트 신규 저장
     * - 견적원가(EC) 프로젝트로부터 이관하여 생성한다.
     * - 프로젝트 코드를 자동 채번하고, 초기 현상차수(ccRev)를 1로 설정한다.
     *
     * @param param 견적원가 연계 정보 (ecPjtCd, pjtNm, bizUnit 등)
     * @return 처리 결과
     */
    @Transactional
    public Map<String, Object> saveCurrentCostPjt(Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();

        // 프로젝트 코드 자동 채번 (CC20260001 형식)
        String newPjtCd = currentCostRepository.findNewCurrentCostPjtCd();
        param.put("pjtCd", newPjtCd);
        param.put("ccRev", 1);       // 초기 현상차수
        param.put("progSts", "D");    // 초기 진행상태: Draft
        param.put("sts", "T");        // 초기 상태: Temp

        currentCostRepository.insertCurrentCostPjt(param);

        resultMap.put("resultStatus", "SUCCESS");
        resultMap.put("pjtCd", newPjtCd);
        return resultMap;
    }

    /**
     * 현상원가 프로젝트 진행상태 변경
     * - D(Draft) → P(진행중) → A(확정) → C(완료) 순서로만 변경 가능
     *
     * @param param 대상 프로젝트 (pjtCd, ccRev, progSts)
     * @return 처리 결과
     */
    @Transactional
    public Map<String, Object> changeStatusCurrentCostPjt(Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();

        String currentSts = (String) param.getOrDefault("progSts", "");
        String nextSts;

        // 상태 전이 규칙
        switch (currentSts) {
            case "D": nextSts = "P"; break;  // Draft → 진행중
            case "P": nextSts = "A"; break;  // 진행중 → 확정
            case "A": nextSts = "C"; break;  // 확정 → 완료
            default:
                throw new RuntimeException(
                    "현재 상태에서는 변경할 수 없습니다. (현재 상태: " + currentSts + ")"
                );
        }

        param.put("nextProgSts", nextSts);
        currentCostRepository.updateCurrentCostProgSts(param);

        resultMap.put("resultStatus", "SUCCESS");
        resultMap.put("progSts", nextSts);
        return resultMap;
    }

    /**
     * 현상원가 재산출
     * - 현재 차수 데이터를 복사하여 차수(ccRev)를 +1 증가시킨다.
     * - 신규 차수의 진행상태는 D(Draft)로 초기화된다.
     *
     * @param param 대상 프로젝트 (pjtCd, ccRev)
     * @return 처리 결과
     */
    @Transactional
    public Map<String, Object> recalculateCurrentCostPjt(Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();

        // 현재 최대 차수 조회
        int maxRev = currentCostRepository.findMaxCcRev(param);
        int newRev = maxRev + 1;

        param.put("newCcRev", newRev);
        param.put("progSts", "D");  // 신규 차수 초기 상태

        // 기존 차수 기반 신규 차수 생성
        currentCostRepository.insertCurrentCostPjtByRecalc(param);

        resultMap.put("resultStatus", "SUCCESS");
        resultMap.put("ccRev", newRev);
        return resultMap;
    }
}
