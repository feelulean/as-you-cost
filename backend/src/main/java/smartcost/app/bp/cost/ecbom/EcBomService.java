package smartcost.app.bp.cost.ecbom;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import javax.inject.Inject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 견적BOM 관리 Service
 *
 * - BOM 데이터의 계층형 조회, 통째 저장(Delete-Insert), 삭제를 처리한다.
 * - 재료비 집계: 각 부품의 (수량 × 단가)를 계산하고,
 *   상위 품목에 하위 품목의 재료비 합계를 누적한다.
 */
@Service
public class EcBomService {

    @Inject
    private EcBomRepository ecBomRepository;

    /**
     * 견적BOM 목록 조회 (계층 정렬)
     * - WITH RECURSIVE CTE를 사용하여 Level 순서대로 정렬된 Flat List를 반환
     * - 프론트엔드에서 upItemCd 기반으로 트리 구조를 구성한다.
     *
     * @param param ecPjtCd + costCd: 견적 프로젝트 코드 + 원가코드
     * @return BOM 목록 (계층 순서)
     */
    public List<Map<String, Object>> findListEcBom(Map<String, Object> param) {
        return ecBomRepository.findListEcBom(param);
    }

    /**
     * 견적BOM 전체 저장 (Delete → Insert)
     * - 기존 BOM 전체를 삭제한 후 프론트에서 전송된 bomList를 일괄 등록한다.
     * - 저장 시 수량×단가=재료비를 서버에서 재계산하여 정합성을 보장한다.
     *
     * @param param ecPjtCd + bomList: BOM 전체 데이터
     * @return 처리 결과
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveListEcBom(Map<String, Object> param) {
        String ecPjtCd = (String) param.get("ecPjtCd");
        String costCd  = (String) param.get("costCd");
        List<Map<String, Object>> bomList = (List<Map<String, Object>>) param.get("bomList");
        Map<String, Object> resultMap = new HashMap<>();

        // 1단계: 해당 원가코드의 기존 BOM 삭제
        Map<String, Object> deleteParam = new HashMap<>();
        deleteParam.put("ecPjtCd", ecPjtCd);
        deleteParam.put("costCd", costCd);
        ecBomRepository.deleteEcBomByPjt(deleteParam);

        // 2단계: 신규 BOM 전체 등록 (재료비 서버 재계산)
        for (Map<String, Object> row : bomList) {
            row.put("ecPjtCd", ecPjtCd);
            row.put("costCd", costCd);

            // 수량 × 단가 = 재료비 (서버 측 정합성 보장)
            BigDecimal qty       = toBigDecimal(row.get("qty"));
            BigDecimal unitPrice = toBigDecimal(row.get("unitPrice"));
            BigDecimal matCost   = qty.multiply(unitPrice);
            row.put("matCost", matCost.longValue());

            ecBomRepository.insertEcBom(row);
        }

        resultMap.put("resultStatus", "SUCCESS");
        resultMap.put("savedCount", bomList.size());
        return resultMap;
    }

    /**
     * 견적BOM 선택 삭제
     * - 선택된 품목과 해당 품목의 하위 품목(자식)을 함께 삭제한다.
     *
     * @param param ecPjtCd + deleteList: 삭제 대상 목록
     * @return 처리 결과
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteListEcBom(Map<String, Object> param) {
        String costCd = (String) param.get("costCd");
        List<Map<String, Object>> deleteList = (List<Map<String, Object>>) param.get("deleteList");
        Map<String, Object> resultMap = new HashMap<>();

        for (Map<String, Object> row : deleteList) {
            row.put("costCd", costCd);
            // 하위 품목 재귀 삭제
            ecBomRepository.deleteEcBomWithChildren(row);
        }

        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }

    /**
     * 재료비 집계
     * - 리프(leaf) 노드부터 상위로 올라가며 재료비를 누적 합산한다.
     * - 각 부품: matCost = qty × unitPrice
     * - 상위 부품: matCost = 자신의 (qty × unitPrice) + SUM(하위 부품 matCost)
     *
     * @param param ecPjtCd: 대상 프로젝트
     * @return 집계 결과 (총 재료비)
     */
    @Transactional
    public Map<String, Object> calculateMaterialCost(Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();

        // 1단계: 모든 부품의 개별 재료비 갱신 (qty × unitPrice)
        ecBomRepository.updateAllMatCost(param);

        // 2단계: 상위 품목에 하위 합계 누적
        ecBomRepository.updateParentMatCost(param);

        // 3단계: 총 재료비 조회
        BigDecimal totalMatCost = ecBomRepository.findTotalMatCost(param);

        resultMap.put("resultStatus", "SUCCESS");
        resultMap.put("totalMatCost", totalMatCost);
        return resultMap;
    }

    /**
     * 기존단가 가져오기 (I/F) — Mock 구현
     * - 전달받은 품목코드(itemCdList)에 대해 가짜 양산단가를 부여한다.
     * - 향후 실제 PIMS/ERP 연동 시, Mock 로직만 외부 API 호출로 교체하면 된다.
     *
     * 처리 흐름:
     *   1) 품목코드 목록으로 Mock 단가 생성 (1,000원 ~ 50,000원 랜덤)
     *   2) 단가 × 수량 = 재료비 재산출
     *   3) DB 일괄 업데이트 (Batch Update)
     *
     * @param param ecPjtCd + itemCdList: 단가 연계 대상 품목코드 목록
     * @return 처리 결과 (updatedCount)
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> interfaceUnitPrices(Map<String, Object> param) {
        String ecPjtCd = (String) param.get("ecPjtCd");
        String costCd  = (String) param.get("costCd");
        List<String> itemCdList = (List<String>) param.get("itemCdList");
        Map<String, Object> resultMap = new HashMap<>();

        if (itemCdList == null || itemCdList.isEmpty()) {
            resultMap.put("resultStatus", "SUCCESS");
            resultMap.put("updatedCount", 0);
            return resultMap;
        }

        // 1단계: Mock I/F — 품목별 가짜 양산단가 생성
        // ※ 향후 실제 연동 시 이 부분을 외부 API 호출로 교체
        List<Map<String, Object>> priceList = new ArrayList<>();
        for (String itemCd : itemCdList) {
            long mockPrice = ThreadLocalRandom.current().nextLong(1000, 50001);
            // 1000 단위로 라운딩 (현실적인 단가)
            mockPrice = (mockPrice / 1000) * 1000;
            if (mockPrice < 1000) mockPrice = 1000;

            Map<String, Object> row = new HashMap<>();
            row.put("itemCd", itemCd);
            row.put("unitPrice", mockPrice);
            priceList.add(row);
        }

        // 2단계: DB 일괄 업데이트 (단가 + 재료비 재산출)
        Map<String, Object> updateParam = new HashMap<>();
        updateParam.put("ecPjtCd", ecPjtCd);
        updateParam.put("costCd", costCd);
        updateParam.put("priceList", priceList);
        ecBomRepository.updateBatchEcBomPrice(updateParam);

        resultMap.put("resultStatus", "SUCCESS");
        resultMap.put("updatedCount", priceList.size());
        return resultMap;
    }

    /**
     * Object → BigDecimal 변환 유틸
     */
    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        if (value instanceof Number) return BigDecimal.valueOf(((Number) value).longValue());
        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }
}
