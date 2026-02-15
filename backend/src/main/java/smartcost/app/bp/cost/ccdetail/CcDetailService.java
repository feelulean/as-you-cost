package smartcost.app.bp.cost.ccdetail;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 현상원가 상세 기능 Service
 * - 현상원가 등록(상세정보, 원가코드, 수량/할인율, 담당자, 일정,
 *   BOM, BOM맵핑, 부품단가, 라인투자비, 라인투자비상세, 라인CT, 기타투자비,
 *   인원계획, 제조경비, 판관비, 손익, 차이분석, 달성도평가상세, 실적평가, 실적자재비)
 */
@Service
public class CcDetailService {

    @Inject
    private CcDetailRepository ccDetailRepository;

    /* ═══ 범용 목록 조회 ═══ */
    public List<Map<String, Object>> findList(String entity, Map<String, Object> param) {
        return ccDetailRepository.findList(entity, param);
    }

    /* ═══ 현상원가 상세 단건 조회 ═══ */
    public Map<String, Object> findCcDetail(Map<String, Object> param) {
        Map<String, Object> result = ccDetailRepository.findOne("CcDetail", param);
        if (result == null) result = new HashMap<>();
        return result;
    }

    /* ═══ 현상원가 상세 저장 (Insert or Update) ═══ */
    @Transactional
    public Map<String, Object> saveCcDetail(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        int cnt = ccDetailRepository.count("CcDetail", param);
        if (cnt > 0) {
            ccDetailRepository.update("CcDetail", param);
        } else {
            ccDetailRepository.insert("CcDetail", param);
        }
        result.put("status", "OK");
        return result;
    }

    /* ═══ 범용 목록 저장 (Insert/Update by _rowStatus) ═══ */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveList(String entity, Map<String, Object> param) {
        List<Map<String, Object>> saveList = (List<Map<String, Object>>) param.get("saveList");
        Map<String, Object> result = new HashMap<>();

        if (saveList != null) {
            for (Map<String, Object> row : saveList) {
                String rowStatus = row.containsKey("_rowStatus")
                        ? (String) row.get("_rowStatus") : "U";

                if ("C".equals(rowStatus)) {
                    ccDetailRepository.insert(entity, row);
                } else {
                    ccDetailRepository.update(entity, row);
                }
            }
        }
        result.put("status", "OK");
        result.put("count", saveList != null ? saveList.size() : 0);
        return result;
    }

    /* ═══ 범용 목록 삭제 ═══ */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteList(String entity, Map<String, Object> param) {
        List<Map<String, Object>> deleteList = (List<Map<String, Object>>) param.get("deleteList");
        Map<String, Object> result = new HashMap<>();

        if (deleteList != null) {
            for (Map<String, Object> row : deleteList) {
                ccDetailRepository.delete(entity, row);
            }
        }
        result.put("status", "OK");
        result.put("count", deleteList != null ? deleteList.size() : 0);
        return result;
    }

    /* ═══ 제조경비 계산 ═══ */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> calculateMfgCost(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 제조경비 = 직접노무비 + 간접노무비 + 생산직접경비 + 인건비성경비
        //          + 기타제조경비 + 감가상각비(건구축물+생산라인+기타)
        //          + 외주가공비 + 금형비 + 연구개발비 + 기타경비
        int cnt = ccDetailRepository.count("MfgCost", param);
        if (cnt > 0) {
            ccDetailRepository.update("MfgCost", param);
        } else {
            ccDetailRepository.insert("MfgCost", param);
        }
        result.put("status", "OK");
        result.put("message", "제조경비 계산 완료");
        return result;
    }

    /* ═══ 판매관리비 계산 ═══ */
    @Transactional
    public Map<String, Object> calculateSgaCost(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        int cnt = ccDetailRepository.count("SgaCost", param);
        if (cnt > 0) {
            ccDetailRepository.update("SgaCost", param);
        } else {
            ccDetailRepository.insert("SgaCost", param);
        }
        result.put("status", "OK");
        result.put("message", "판매관리비 계산 완료");
        return result;
    }

    /* ═══ 손익계산서 산출 ═══ */
    @Transactional
    public Map<String, Object> calculatePlStmt(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 손익계산서 = 매출액 - 재료비 - 노무비 - 제조경비 - 판관비
        int cnt = ccDetailRepository.count("PlStmt", param);
        if (cnt > 0) {
            ccDetailRepository.update("PlStmt", param);
        } else {
            ccDetailRepository.insert("PlStmt", param);
        }
        result.put("status", "OK");
        result.put("message", "손익계산서 산출 완료");
        return result;
    }

    /* ═══ 차이분석 생성 ═══ */
    @Transactional
    public Map<String, Object> generateDiffAnalysis(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 견적원가 vs 현상원가 차이분석 데이터 생성
        int cnt = ccDetailRepository.count("DiffAnalysis", param);
        if (cnt > 0) {
            ccDetailRepository.update("DiffAnalysis", param);
        } else {
            ccDetailRepository.insert("DiffAnalysis", param);
        }
        result.put("status", "OK");
        result.put("message", "차이분석 생성 완료");
        return result;
    }

    /* ═══ 달성도 평가 상세 생성 ═══ */
    @Transactional
    public Map<String, Object> generateAchvEvalDtl(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 목표원가 대비 현상원가 달성도 평가 상세 데이터 생성
        int cnt = ccDetailRepository.count("AchvEvalDtl", param);
        if (cnt > 0) {
            ccDetailRepository.update("AchvEvalDtl", param);
        } else {
            ccDetailRepository.insert("AchvEvalDtl", param);
        }
        result.put("status", "OK");
        result.put("message", "달성도 평가 상세 생성 완료");
        return result;
    }

    /* ═══ 실적평가 생성 ═══ */
    @Transactional
    public Map<String, Object> generateActEval(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 실적 기반 평가 데이터 생성
        int cnt = ccDetailRepository.count("ActEval", param);
        if (cnt > 0) {
            ccDetailRepository.update("ActEval", param);
        } else {
            ccDetailRepository.insert("ActEval", param);
        }
        result.put("status", "OK");
        result.put("message", "실적평가 생성 완료");
        return result;
    }

    /* ═══ 실적자재비 계산 ═══ */
    @Transactional
    public Map<String, Object> calculateActMaterial(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 실적 자재비 = BOM 기준 실적 단가 x 수량 합산
        int cnt = ccDetailRepository.count("ActMaterial", param);
        if (cnt > 0) {
            ccDetailRepository.update("ActMaterial", param);
        } else {
            ccDetailRepository.insert("ActMaterial", param);
        }
        result.put("status", "OK");
        result.put("message", "실적자재비 계산 완료");
        return result;
    }
}
