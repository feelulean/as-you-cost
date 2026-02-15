package smartcost.app.bp.cost.ecprofit;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 견적원가 수익성 분석 Service
 *
 * - 견적기준가(표준원가) 취합 및 WACC 수익성 지표 데이터를 관리한다.
 * - BOM 재료비 집계: PCM_EC_BOM 테이블의 최상위 품목 MAT_COST 합계를 조회한다.
 * - 저장: 기존 데이터 존재 여부에 따라 Insert/Update를 분기한다.
 */
@Service
public class EcProfitService {

    @Inject
    private EcProfitRepository ecProfitRepository;

    /**
     * 프로젝트 목록 조회 (좌측 그리드 — 견적원가 마스터)
     */
    public List<Map<String, Object>> findListEcPjtForProfit(Map<String, Object> param) {
        return ecProfitRepository.findListEcPjtForProfit(param);
    }

    /**
     * 수익성 분석 데이터 단건 조회
     */
    public Map<String, Object> findEcProfit(Map<String, Object> param) {
        Map<String, Object> result = ecProfitRepository.findEcProfit(param);
        return result != null ? result : new HashMap<>();
    }

    /**
     * BOM 재료비 집계
     * - PCM_EC_BOM 테이블에서 해당 프로젝트의 최상위 품목 MAT_COST 합계를 조회
     */
    public Map<String, Object> aggregateMaterialCost(Map<String, Object> param) {
        BigDecimal totalMatCost = ecProfitRepository.aggregateMaterialCost(param);
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultStatus", "SUCCESS");
        resultMap.put("totalMatCost", totalMatCost != null ? totalMatCost : BigDecimal.ZERO);
        return resultMap;
    }

    /**
     * 수익성 분석 데이터 저장 (Insert or Update)
     * - 기존 데이터 존재 시 Update, 없으면 Insert
     */
    @Transactional
    public Map<String, Object> saveEcProfit(Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();

        // 기존 데이터 존재 여부 확인
        int count = ecProfitRepository.countEcProfit(param);

        if (count > 0) {
            ecProfitRepository.updateEcProfit(param);
        } else {
            ecProfitRepository.insertEcProfit(param);
        }

        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }
}
