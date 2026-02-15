package smartcost.app.bp.cost.targetcost;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 목표원가 부문별 Guide 산출 Service
 *
 * TC03 프로세스를 구현한다:
 *   1) 최신 판가 × (1 − 목표수익률) = 목표원가 산출
 *   2) 총 절감 필요액 = 견적/현상원가 − 목표원가
 *   3) 부문별 원가 비중에 따라 절감 Guide 금액 배부
 *   4) 각 부문별 절감률 산출
 */
@Service
public class TargetCostGuideService {

    @Inject
    private TargetCostGuideRepository targetCostGuideRepository;

    /**
     * 부문별 목표 Guide 목록 조회
     */
    public List<Map<String, Object>> findListTargetCostGuide(Map<String, Object> param) {
        return targetCostGuideRepository.findListTargetCostGuide(param);
    }

    /**
     * 부문별 목표 Guide 산출 (TC03 핵심 로직)
     *
     * ──────────────────────────────────────────────
     * [산출 공식]
     *
     *   목표원가(총)  = 판가(총) × (1 − 목표수익률)
     *   총 절감필요액  = 견적원가(총) − 목표원가(총)
     *   부문별 Guide  = 총 절감필요액 × (부문 원가 / 견적원가 합계)
     *   부문별 절감률  = 부문별 Guide / 부문 원가 × 100
     *   단위당 금액    = 총금액 / 생산수량
     * ──────────────────────────────────────────────
     *
     * @param param tgtPjtCd: 목표원가 프로젝트 코드
     * @return 산출된 Guide 목록
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> calculateTargetGuide(Map<String, Object> param) {

        String tgtPjtCd = (String) param.get("tgtPjtCd");

        // ── Step 1: 프로젝트 기본 정보 조회 ──────────────────────
        // sellPriceTotAmt : 판가(총액)
        // tgtProfitRate   : 목표수익률 (예: 0.08 = 8%)
        // prodQty         : 생산수량
        // ecPjtCd         : 연계 견적코드
        Map<String, Object> pjtInfo = targetCostGuideRepository.findTargetCostPjtInfo(param);

        if (pjtInfo == null) {
            throw new RuntimeException("프로젝트 정보를 찾을 수 없습니다. (코드: " + tgtPjtCd + ")");
        }

        // 배부확정(A) 이후 상태에서는 재산출 불가
        String sts = (String) pjtInfo.getOrDefault("sts", "T");
        if ("A".equals(sts) || "E".equals(sts) || "C".equals(sts)) {
            throw new RuntimeException("배부확정 이후 상태에서는 Guide를 재산출할 수 없습니다. (현재 상태: " + sts + ")");
        }

        BigDecimal sellPriceTotAmt = toBigDecimal(pjtInfo.get("sellPriceTotAmt"));
        BigDecimal tgtProfitRate   = toBigDecimal(pjtInfo.get("tgtProfitRate"));
        BigDecimal prodQty         = toBigDecimal(pjtInfo.get("prodQty"));

        if (sellPriceTotAmt.compareTo(BigDecimal.ZERO) == 0) {
            throw new RuntimeException("판가 정보가 등록되지 않았습니다. 영업부문에 판가 등록을 요청하세요.");
        }
        if (prodQty.compareTo(BigDecimal.ZERO) == 0) {
            prodQty = BigDecimal.ONE; // 0 방지
        }

        // ── Step 2: 견적/현상원가 부문별 데이터 조회 ────────────
        Map<String, Object> ecParam = new HashMap<>();
        ecParam.put("ecPjtCd", pjtInfo.get("ecPjtCd"));
        List<Map<String, Object>> ecCostList = targetCostGuideRepository.findListEstimateCostByPjt(ecParam);

        if (ecCostList == null || ecCostList.isEmpty()) {
            throw new RuntimeException("연계된 견적원가 데이터가 없습니다. (견적코드: " + pjtInfo.get("ecPjtCd") + ")");
        }

        // ── Step 3: 견적원가 합계 산출 ───────────────────────────
        BigDecimal ecTotalAmt = BigDecimal.ZERO;
        for (Map<String, Object> ecRow : ecCostList) {
            ecTotalAmt = ecTotalAmt.add(toBigDecimal(ecRow.get("costTotAmt")));
        }

        // ── Step 4: 목표원가 & 총 절감필요액 산출 ────────────────
        //   목표원가(총) = 판가(총) × (1 − 목표수익률)
        BigDecimal targetCostTotAmt = sellPriceTotAmt.multiply(
                BigDecimal.ONE.subtract(tgtProfitRate)
        ).setScale(0, RoundingMode.HALF_UP);

        //   총 절감필요액 = 견적원가(총) − 목표원가(총)
        BigDecimal totalReductionAmt = ecTotalAmt.subtract(targetCostTotAmt);

        // 절감 필요액이 0 이하면 이미 목표 달성
        if (totalReductionAmt.compareTo(BigDecimal.ZERO) <= 0) {
            totalReductionAmt = BigDecimal.ZERO;
        }

        // ── Step 5: 부문별 Guide 배부 ────────────────────────────
        // 기존 Guide 삭제 후 재산출
        Map<String, Object> deleteParam = new HashMap<>();
        deleteParam.put("tgtPjtCd", tgtPjtCd);
        targetCostGuideRepository.deleteTargetCostGuideByPjt(deleteParam);

        List<Map<String, Object>> resultList = new ArrayList<>();
        int seq = 0;

        for (Map<String, Object> ecRow : ecCostList) {
            seq++;
            BigDecimal costTotAmt = toBigDecimal(ecRow.get("costTotAmt"));

            // 부문별 Guide = 총 절감필요액 × (부문 원가 / 견적원가 합계)
            BigDecimal guideTgtTotAmt = BigDecimal.ZERO;
            if (ecTotalAmt.compareTo(BigDecimal.ZERO) != 0) {
                guideTgtTotAmt = totalReductionAmt.multiply(costTotAmt)
                        .divide(ecTotalAmt, 0, RoundingMode.HALF_UP);
            }

            // 단위당 금액 = 총금액 / 생산수량
            BigDecimal ecCostUnitAmt     = costTotAmt.divide(prodQty, 0, RoundingMode.HALF_UP);
            BigDecimal guideTgtUnitAmt   = guideTgtTotAmt.divide(prodQty, 0, RoundingMode.HALF_UP);

            // 절감률 = Guide / 부문원가 × 100
            BigDecimal saveRate = BigDecimal.ZERO;
            if (costTotAmt.compareTo(BigDecimal.ZERO) != 0) {
                saveRate = guideTgtTotAmt.multiply(BigDecimal.valueOf(100))
                        .divide(costTotAmt, 2, RoundingMode.HALF_UP);
            }

            // ── 결과 Row 구성 ──
            Map<String, Object> row = new HashMap<>();
            row.put("tgtPjtCd",        tgtPjtCd);
            row.put("guideSeq",        seq);
            row.put("costItemCd",      ecRow.get("costItemCd"));
            row.put("costItemNm",      ecRow.get("costItemNm"));
            row.put("deptCd",          ecRow.get("deptCd"));
            row.put("deptNm",          ecRow.get("deptNm"));
            row.put("ecCostTotAmt",    costTotAmt.longValue());
            row.put("ecCostUnitAmt",   ecCostUnitAmt.longValue());
            row.put("guideTgtTotAmt",  guideTgtTotAmt.longValue());
            row.put("guideTgtUnitAmt", guideTgtUnitAmt.longValue());
            row.put("cftTgtTotAmt",    0L);  // CFT 확정은 사용자 입력
            row.put("cftTgtUnitAmt",   0L);
            row.put("saveRate",        saveRate.doubleValue());
            row.put("prodQty",         prodQty.longValue());
            row.put("sts",             "T");

            // DB 저장
            targetCostGuideRepository.insertTargetCostGuide(row);
            resultList.add(row);
        }

        return resultList;
    }

    /**
     * 부문별 목표 Guide 저장 (CFT 확정 금액 등 사용자 수정분)
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveListTargetCostGuide(Map<String, Object> param) {
        List<Map<String, Object>> saveList = (List<Map<String, Object>>) param.get("saveList");
        String tgtPjtCd = (String) param.get("tgtPjtCd");
        Map<String, Object> resultMap = new HashMap<>();

        // 프로젝트 상태 확인 — 배부확정(A) 이후에는 저장 불가
        Map<String, Object> pjtParam = new HashMap<>();
        pjtParam.put("tgtPjtCd", tgtPjtCd);
        Map<String, Object> pjtInfo = targetCostGuideRepository.findTargetCostPjtInfo(pjtParam);
        if (pjtInfo != null) {
            String sts = (String) pjtInfo.getOrDefault("sts", "T");
            if ("A".equals(sts) || "E".equals(sts) || "C".equals(sts)) {
                throw new RuntimeException("배부확정 이후 상태에서는 Guide를 수정할 수 없습니다. (현재 상태: " + sts + ")");
            }
        }

        for (Map<String, Object> row : saveList) {
            row.put("tgtPjtCd", tgtPjtCd);
            targetCostGuideRepository.updateTargetCostGuide(row);
        }

        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }

    /**
     * Object → BigDecimal 안전 변환
     */
    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }
        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }
}
