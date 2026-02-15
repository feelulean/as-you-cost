package smartcost.app.bp.cost.currentcost;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * YHJY As-You-Cost — 달성도 평가 Service
 *
 * - 현상원가 프로젝트별 목표원가 대비 달성도를 평가한다.
 * - 평가 생성(createAchievementEval) 시 EC/TC 테이블을 조인하여
 *   기초 데이터를 자동 구성한다.
 *
 * [달성도 산출 공식]
 *   절감목표 = 견적원가(EC) - 목표원가(TC)
 *   절감액   = 견적원가(EC) - 현상원가(CUR, 실적)
 *   달성도   = (절감액 / 절감목표) × 100
 *   달성여부 = 달성도 ≥ 100 → Y, 그 외 → N
 */
@Service
public class AchievementEvalService {

    @Inject
    private AchievementEvalRepository achievementEvalRepository;

    /**
     * 달성도 평가 목록 조회
     *
     * @param param 조회 조건 (curPjtCd, bizUnit, custNm, achvYn)
     * @return 달성도 평가 목록
     */
    public List<Map<String, Object>> findListAchievementEval(Map<String, Object> param) {
        return achievementEvalRepository.findListAchievementEval(param);
    }

    /**
     * 달성도 평가 데이터 생성
     *
     * EC(견적원가)와 TC(목표원가) 테이블을 조인하여
     * 현상원가 프로젝트별 초기 달성도 평가 기초 데이터를 구성한다.
     *
     * <처리 흐름>
     * 1. PCM_CUR_PJT_MSTR (현상원가 프로젝트)를 기준으로
     *    PCM_EC_PROFIT (견적원가 수익성) → TOTAL_ESTM_COST(총견적원가) 가져옴
     *    PCM_TGT_PJT_MSTR → PCM_TGT_GUIDE → SUM(GUIDE_TGT_TOT_AMT)(목표원가 합계) 가져옴
     * 2. 이미 평가 데이터가 존재하는 프로젝트는 스킵 (NOT EXISTS)
     * 3. 절감목표(EC-TGT)를 산출하고 INSERT
     *    현상원가(실적)는 0으로 초기화 → 사용자가 나중에 그리드에서 입력
     *
     * @param param 조건 없음 (전체 프로젝트 대상)
     * @return 생성된 건수
     */
    @Transactional
    public Map<String, Object> createAchievementEval(Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();

        // 1. EC/TC 조인하여 기초 데이터 조회
        List<Map<String, Object>> baseList =
                achievementEvalRepository.findListAchievementEvalBase(param);

        int createdCount = 0;

        // 2. 건별 달성도 초기값 산출 후 INSERT
        for (Map<String, Object> base : baseList) {
            BigDecimal ecCost  = toBigDecimal(base.get("ecTotalCost"));
            BigDecimal tgtCost = toBigDecimal(base.get("tgtTotalCost"));

            // 절감목표 = EC - TGT
            BigDecimal saveTgt = ecCost.subtract(tgtCost);

            // 현상원가(실적)는 0 → 사용자 입력 대기
            BigDecimal curCost = BigDecimal.ZERO;
            BigDecimal saveAct = ecCost.subtract(curCost);

            // 달성도(%)
            BigDecimal achvRate = BigDecimal.ZERO;
            if (saveTgt.compareTo(BigDecimal.ZERO) != 0) {
                achvRate = saveAct.multiply(BigDecimal.valueOf(100))
                        .divide(saveTgt, 2, RoundingMode.HALF_UP);
            }

            // 달성여부
            String achvYn = achvRate.compareTo(BigDecimal.valueOf(100)) >= 0 ? "Y" : "N";

            // INSERT 파라미터 구성
            Map<String, Object> insertParam = new HashMap<>();
            insertParam.put("curPjtCd",     base.get("curPjtCd"));
            insertParam.put("ecPjtCd",      base.get("ecPjtCd"));
            insertParam.put("tgtPjtCd",     base.get("tgtPjtCd"));
            insertParam.put("pjtNm",        base.get("pjtNm"));
            insertParam.put("bizUnit",      base.get("bizUnit"));
            insertParam.put("custNm",       base.get("custNm"));
            insertParam.put("carType",      base.get("carType"));
            insertParam.put("ecTotalCost",  ecCost);
            insertParam.put("tgtTotalCost", tgtCost);
            insertParam.put("curTotalCost", curCost);
            insertParam.put("saveTgtAmt",   saveTgt);
            insertParam.put("saveActAmt",   saveAct);
            insertParam.put("achvRate",     achvRate);
            insertParam.put("achvYn",       achvYn);
            insertParam.put("evalDt",       null);
            insertParam.put("rmk",          null);

            achievementEvalRepository.insertAchievementEval(insertParam);
            createdCount++;
        }

        resultMap.put("resultStatus", "SUCCESS");
        resultMap.put("createdCount", createdCount);
        return resultMap;
    }

    /**
     * 달성도 평가 목록 저장 (현상원가 실적 입력, 달성도 갱신)
     *
     * @param param saveList: [{curPjtCd, curTotalCost, evalDt, rmk, ...}]
     * @return 처리 결과
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveListAchievementEval(Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();

        List<Map<String, Object>> saveList = (List<Map<String, Object>>) param.get("saveList");
        if (saveList == null || saveList.isEmpty()) {
            resultMap.put("resultStatus", "FAIL");
            resultMap.put("message", "저장할 데이터가 없습니다.");
            return resultMap;
        }

        for (Map<String, Object> row : saveList) {
            achievementEvalRepository.updateAchievementEval(row);
        }

        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }

    /**
     * 달성도 평가 삭제
     *
     * @param param deleteList: [{curPjtCd}]
     * @return 처리 결과
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteListAchievementEval(Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();

        List<Map<String, Object>> deleteList = (List<Map<String, Object>>) param.get("deleteList");
        if (deleteList == null || deleteList.isEmpty()) {
            resultMap.put("resultStatus", "FAIL");
            resultMap.put("message", "삭제할 데이터가 없습니다.");
            return resultMap;
        }

        for (Map<String, Object> row : deleteList) {
            Map<String, Object> delParam = new HashMap<>();
            delParam.put("curPjtCd", row.get("curPjtCd"));
            achievementEvalRepository.deleteAchievementEval(delParam);
        }

        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }

    /**
     * Object → BigDecimal 안전 변환
     */
    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal) return (BigDecimal) val;
        if (val instanceof Number) return BigDecimal.valueOf(((Number) val).doubleValue());
        try {
            return new BigDecimal(val.toString());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }
}
