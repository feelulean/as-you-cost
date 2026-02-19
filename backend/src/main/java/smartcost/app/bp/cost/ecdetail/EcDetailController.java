package smartcost.app.bp.cost.ecdetail;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 견적정보 상세 관리 Controller
 * - 견적정보 등록의 6개 탭(상세정보, 원가코드/판가, 수량/할인율, 담당자, 일정, 수주결과)을 통합 관리
 * - 투자비 관리, 제조경비 계산, 판매관리비 계산, 손익계산서, 민감도 분석, NPV 분석
 */
@RestController
@RequestMapping("/bp/cost/ec/detail")
public class EcDetailController {

    @Inject
    private EcDetailService ecDetailService;

    /* ═══ 견적정보 상세 ═══ */
    @RequestMapping("/findEcDetail.do")
    public Map<String, Object> findEcDetail(@RequestBody Map<String, Object> param) {
        return ecDetailService.findEcDetail(param);
    }
    @RequestMapping("/saveEcDetail.do")
    public Map<String, Object> saveEcDetail(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveEcDetail(param);
    }

    /* ═══ 원가코드/판가 ═══ */
    @RequestMapping("/findListCostCode.do")
    public List<Map<String, Object>> findListCostCode(@RequestBody Map<String, Object> param) {
        return ecDetailService.findList("CostCode", param);
    }
    @RequestMapping("/saveListCostCode.do")
    public Map<String, Object> saveListCostCode(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveList("CostCode", param);
    }

    /* ═══ 수량/할인율 ═══ */
    @RequestMapping("/findListQtyDisc.do")
    public List<Map<String, Object>> findListQtyDisc(@RequestBody Map<String, Object> param) {
        return ecDetailService.findList("QtyDisc", param);
    }
    @RequestMapping("/saveListQtyDisc.do")
    public Map<String, Object> saveListQtyDisc(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveQtyDisc(param);
    }

    /* ═══ 담당자 ═══ */
    @RequestMapping("/findListManager.do")
    public List<Map<String, Object>> findListManager(@RequestBody Map<String, Object> param) {
        return ecDetailService.findList("Manager", param);
    }
    @RequestMapping("/saveListManager.do")
    public Map<String, Object> saveListManager(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveList("Manager", param);
    }
    @RequestMapping("/deleteListManager.do")
    public Map<String, Object> deleteListManager(@RequestBody Map<String, Object> param) {
        return ecDetailService.deleteList("Manager", param);
    }

    /* ═══ 일정 ═══ */
    @RequestMapping("/findListSchedule.do")
    public List<Map<String, Object>> findListSchedule(@RequestBody Map<String, Object> param) {
        return ecDetailService.findList("Schedule", param);
    }
    @RequestMapping("/saveListSchedule.do")
    public Map<String, Object> saveListSchedule(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveList("Schedule", param);
    }

    /* ═══ 수주결과 ═══ */
    @RequestMapping("/findOrderResult.do")
    public Map<String, Object> findOrderResult(@RequestBody Map<String, Object> param) {
        return ecDetailService.findEcDetail(param); // reuse single-record fetch
    }
    @RequestMapping("/saveOrderResult.do")
    public Map<String, Object> saveOrderResult(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveEcDetail(param);
    }

    /* ═══ 투자비 - 라인투자비 ═══ */
    @RequestMapping("/findListLineInvest.do")
    public List<Map<String, Object>> findListLineInvest(@RequestBody Map<String, Object> param) {
        return ecDetailService.findList("LineInvest", param);
    }
    @RequestMapping("/saveListLineInvest.do")
    public Map<String, Object> saveListLineInvest(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveList("LineInvest", param);
    }
    @RequestMapping("/deleteListLineInvest.do")
    public Map<String, Object> deleteListLineInvest(@RequestBody Map<String, Object> param) {
        return ecDetailService.deleteList("LineInvest", param);
    }

    /* ═══ 투자비 - 기타투자비 ═══ */
    @RequestMapping("/findListOtherInvest.do")
    public List<Map<String, Object>> findListOtherInvest(@RequestBody Map<String, Object> param) {
        return ecDetailService.findList("OtherInvest", param);
    }
    @RequestMapping("/saveListOtherInvest.do")
    public Map<String, Object> saveListOtherInvest(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveList("OtherInvest", param);
    }
    @RequestMapping("/deleteListOtherInvest.do")
    public Map<String, Object> deleteListOtherInvest(@RequestBody Map<String, Object> param) {
        return ecDetailService.deleteList("OtherInvest", param);
    }

    /* ═══ 인원계획 ═══ */
    @RequestMapping("/findListManpower.do")
    public List<Map<String, Object>> findListManpower(@RequestBody Map<String, Object> param) {
        return ecDetailService.findList("Manpower", param);
    }
    @RequestMapping("/saveListManpower.do")
    public Map<String, Object> saveListManpower(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveList("Manpower", param);
    }

    /* ═══ 제조경비 ═══ */
    @RequestMapping("/findListMfgCost.do")
    public Map<String, Object> findListMfgCost(@RequestBody Map<String, Object> param) {
        return ecDetailService.findMfgCostStructured(param);
    }
    @RequestMapping("/saveMfgCost.do")
    public Map<String, Object> saveMfgCost(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveList("MfgCost", param);
    }
    @RequestMapping("/calculateMfgCost.do")
    public Map<String, Object> calculateMfgCost(@RequestBody Map<String, Object> param) {
        return ecDetailService.calculateMfgCost(param);
    }

    /* ═══ 판매관리비 ═══ */
    @RequestMapping("/findListSgaCost.do")
    public Map<String, Object> findListSgaCost(@RequestBody Map<String, Object> param) {
        return ecDetailService.findSgaCostData(param);
    }
    @RequestMapping("/saveSgaCost.do")
    public Map<String, Object> saveSgaCost(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveList("SgaCost", param);
    }
    @RequestMapping("/calculateSgaCost.do")
    public Map<String, Object> calculateSgaCost(@RequestBody Map<String, Object> param) {
        return ecDetailService.calculateSgaCost(param);
    }

    /* ═══ 손익계산서 ═══ */
    @RequestMapping("/findListPlStmt.do")
    public Map<String, Object> findListPlStmt(@RequestBody Map<String, Object> param) {
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("plList", ecDetailService.findListPlStmtPivot(param));
        return result;
    }
    @RequestMapping("/calculatePlStmt.do")
    public Map<String, Object> calculatePlStmt(@RequestBody Map<String, Object> param) {
        return ecDetailService.calculatePlStmt(param);
    }

    /* ═══ 민감도 분석 ═══ */
    @RequestMapping("/findListSensitivity.do")
    public List<Map<String, Object>> findListSensitivity(@RequestBody Map<String, Object> param) {
        return ecDetailService.findList("Sensitivity", param);
    }
    @RequestMapping("/saveSensitivity.do")
    public Map<String, Object> saveSensitivity(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveList("Sensitivity", param);
    }
    @RequestMapping("/findListSensitivityVar.do")
    public List<Map<String, Object>> findListSensitivityVar(@RequestBody Map<String, Object> param) {
        return ecDetailService.findList("SensitivityVar", param);
    }
    @RequestMapping("/saveSensitivityVar.do")
    public Map<String, Object> saveSensitivityVar(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveList("SensitivityVar", param);
    }

    /* ═══ 자금조달계획 ═══ */
    @RequestMapping("/findListFundPlan.do")
    public List<Map<String, Object>> findListFundPlan(@RequestBody Map<String, Object> param) {
        return ecDetailService.findList("FundPlan", param);
    }
    @RequestMapping("/saveListFundPlan.do")
    public Map<String, Object> saveListFundPlan(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveList("FundPlan", param);
    }

    /* ═══ 운전자본 ═══ */
    @RequestMapping("/findWorkCapital.do")
    public Map<String, Object> findWorkCapital(@RequestBody Map<String, Object> param) {
        return ecDetailService.findEcDetail(param);
    }
    @RequestMapping("/saveWorkCapital.do")
    public Map<String, Object> saveWorkCapital(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveEcDetail(param);
    }

    /* ═══ NPV 분석 ═══ */
    @RequestMapping("/findListNpv.do")
    public Map<String, Object> findListNpv(@RequestBody Map<String, Object> param) {
        return ecDetailService.findNpvData(param);
    }
    @RequestMapping("/saveNpv.do")
    public Map<String, Object> saveNpv(@RequestBody Map<String, Object> param) {
        return ecDetailService.saveNpvData(param);
    }
    @RequestMapping("/calculateNpv.do")
    public Map<String, Object> calculateNpv(@RequestBody Map<String, Object> param) {
        return ecDetailService.calculateNpv(param);
    }
}
