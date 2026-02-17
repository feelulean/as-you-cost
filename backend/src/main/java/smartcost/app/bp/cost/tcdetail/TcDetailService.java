package smartcost.app.bp.cost.tcdetail;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 목표원가 상세 기능 Service
 * - 목표원가 등록(담당자, 사양, 판가, 수량/할인율, 개발일정, 양산일정),
 *   원가등록, 달성계획, 달성계획상세, 재산출, 달성현황
 */
@Service
public class TcDetailService {

    @Inject
    private TcDetailRepository tcDetailRepository;

    /* ═══ 범용 목록 조회 ═══ */
    public List<Map<String, Object>> findList(String entity, Map<String, Object> param) {
        return tcDetailRepository.findList(entity, param);
    }

    /* ═══ 목표원가 상세 단건 조회 ═══ */
    public Map<String, Object> findTcDetail(Map<String, Object> param) {
        Map<String, Object> result = tcDetailRepository.findOne("TcDetail", param);
        if (result == null) result = new HashMap<>();
        return result;
    }

    /* ═══ 목표원가 상세 저장 (Insert or Update) ═══ */
    @Transactional
    public Map<String, Object> saveTcDetail(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        int cnt = tcDetailRepository.count("TcDetail", param);
        if (cnt > 0) {
            tcDetailRepository.update("TcDetail", param);
        } else {
            tcDetailRepository.insert("TcDetail", param);
        }
        result.put("status", "OK");
        return result;
    }

    /* ═══ 범용 목록 저장 (Insert/Update by _rowStatus) ═══ */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveList(String entity, Map<String, Object> param) {
        List<Map<String, Object>> saveList = (List<Map<String, Object>>) param.get("saveList");
        String tgtPjtCd = (String) param.get("tgtPjtCd");
        Map<String, Object> result = new HashMap<>();

        if (saveList != null) {
            for (Map<String, Object> row : saveList) {
                if (tgtPjtCd != null && !row.containsKey("tgtPjtCd")) row.put("tgtPjtCd", tgtPjtCd);

                String rowStatus = row.containsKey("_rowStatus")
                        ? (String) row.get("_rowStatus") : "U";

                if ("C".equals(rowStatus)) {
                    tcDetailRepository.insert(entity, row);
                } else {
                    tcDetailRepository.update(entity, row);
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
        String tgtPjtCd = (String) param.get("tgtPjtCd");
        Map<String, Object> result = new HashMap<>();

        if (deleteList != null) {
            for (Map<String, Object> row : deleteList) {
                if (tgtPjtCd != null && !row.containsKey("tgtPjtCd")) row.put("tgtPjtCd", tgtPjtCd);
                tcDetailRepository.delete(entity, row);
            }
        }
        result.put("status", "OK");
        result.put("count", deleteList != null ? deleteList.size() : 0);
        return result;
    }

    /* ═══ 원가등록 생성 (견적/Guide 데이터로부터 원가등록 항목 생성) ═══ */
    @Transactional
    public Map<String, Object> generateTcCostReg(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 기존 원가등록 데이터 삭제 후 견적/Guide 기준으로 재생성
        tcDetailRepository.delete("CostRegByPjt", param);
        tcDetailRepository.insert("CostRegFromGuide", param);
        result.put("status", "OK");
        result.put("message", "원가등록 항목 생성 완료");
        return result;
    }

    /* ═══ 원가등록 확정 (Lock) ═══ */
    @Transactional
    public Map<String, Object> confirmTcCostReg(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 원가등록 상태를 확정(A)으로 변경
        tcDetailRepository.update("CostRegConfirm", param);
        result.put("status", "OK");
        result.put("message", "원가등록 확정 완료");
        return result;
    }

    /* ═══ 달성계획 생성 (원가등록 데이터로부터 달성계획 생성) ═══ */
    @Transactional
    public Map<String, Object> generateTcAchvPlan(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 기존 달성계획 삭제 후 원가등록 기준으로 재생성
        tcDetailRepository.delete("AchvPlanByPjt", param);
        tcDetailRepository.insert("AchvPlanFromCostReg", param);
        result.put("status", "OK");
        result.put("message", "달성계획 생성 완료");
        return result;
    }

    /* ═══ 달성계획 확정 ═══ */
    @Transactional
    public Map<String, Object> confirmTcAchvPlan(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 달성계획 상태를 확정(A)으로 변경
        tcDetailRepository.update("AchvPlanConfirm", param);
        result.put("status", "OK");
        result.put("message", "달성계획 확정 완료");
        return result;
    }

    /* ═══ 달성현황 생성 (달성계획 대비 실적 현황 산출) ═══ */
    @Transactional
    public Map<String, Object> generateTcAchvStatus(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 기존 달성현황 삭제 후 달성계획 대비 실적으로 재생성
        tcDetailRepository.delete("AchvStatusByPjt", param);
        tcDetailRepository.insert("AchvStatusFromPlan", param);
        result.put("status", "OK");
        result.put("message", "달성현황 산출 완료");
        return result;
    }
}
