package smartcost.app.bp.cost.targetcost;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 목표원가 프로젝트 관리 Service
 *
 * - 목표원가 프로젝트의 비즈니스 로직을 처리한다.
 * - 견적원가(EC) 코드 매핑 및 상태(STS) 관리를 포함한다.
 */
@Service
public class TargetCostService {

    @Inject
    private TargetCostRepository targetCostRepository;

    /**
     * 목표원가 프로젝트 목록 조회
     *
     * @param param 조회 조건 (pjtCd, bizUnit, custNm, carType)
     * @return 프로젝트 목록
     */
    public List<Map<String, Object>> findListTargetCostPjt(Map<String, Object> param) {
        return targetCostRepository.findListTargetCostPjt(param);
    }

    /**
     * 목표원가 프로젝트 목록 저장
     * - rowStatus에 따라 Insert / Update를 분기 처리한다.
     * - 신규 등록 시 프로젝트 코드를 자동 채번한다.
     *
     * @param param saveList: 저장 대상 목록
     * @return 처리 결과
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveListTargetCostPjt(Map<String, Object> param) {
        List<Map<String, Object>> saveList = (List<Map<String, Object>>) param.get("saveList");
        Map<String, Object> resultMap = new HashMap<>();

        for (Map<String, Object> row : saveList) {
            String rowStatus = (String) row.getOrDefault("_rowStatus", "");

            if ("C".equals(rowStatus)) {
                // 신규: 프로젝트 코드 자동 채번
                String newPjtCd = targetCostRepository.findNewTargetCostPjtCd();
                row.put("pjtCd", newPjtCd);
                row.put("sts", "T"); // 초기 상태: Targeting
                targetCostRepository.insertTargetCostPjt(row);
            } else if ("U".equals(rowStatus)) {
                // 수정 — 작성중(T) 상태만 수정 허용
                String sts = (String) row.getOrDefault("sts", "");
                if (!"T".equals(sts)) {
                    throw new RuntimeException(
                        "작성중(T) 상태의 프로젝트만 수정할 수 있습니다. (프로젝트 코드: " + row.get("pjtCd") + ", 현재 상태: " + sts + ")"
                    );
                }
                targetCostRepository.updateTargetCostPjt(row);
            }
        }

        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }

    /**
     * 목표원가 프로젝트 목록 삭제
     * - 상태가 'T'(작성중)인 건만 삭제 가능하며,
     *   진행 중(P 이후) 상태는 삭제를 차단한다.
     *
     * @param param deleteList: 삭제 대상 목록
     * @return 처리 결과
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteListTargetCostPjt(Map<String, Object> param) {
        List<Map<String, Object>> deleteList = (List<Map<String, Object>>) param.get("deleteList");
        Map<String, Object> resultMap = new HashMap<>();

        for (Map<String, Object> row : deleteList) {
            String sts = (String) row.getOrDefault("sts", "");

            // T(Targeting) 상태만 삭제 허용
            if (!"T".equals(sts)) {
                throw new RuntimeException("진행 중인 프로젝트는 삭제할 수 없습니다. (프로젝트 코드: " + row.get("pjtCd") + ")");
            }

            targetCostRepository.deleteTargetCostPjt(row);
        }

        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }
}
