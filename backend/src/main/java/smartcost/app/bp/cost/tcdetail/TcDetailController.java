package smartcost.app.bp.cost.tcdetail;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * 목표원가 상세 관리 Controller
 * - 목표원가 등록의 탭(상세정보, 담당자, 사양, 판가, 수량/할인율,
 *   개발일정, 양산일정, 원가등록, 달성계획, 달성계획상세, 재산출, 달성현황)을 통합 관리
 */
@Controller
@RequestMapping("/bp/cost/tc/detail")
public class TcDetailController {

    @Inject
    private TcDetailService tcDetailService;

    /* ═══ 목표원가 상세 (PCM_TGT_PJT_MSTR) ═══ */
    @RequestMapping("/findTcDetail.do")
    @ResponseBody
    public Map<String, Object> findTcDetail(@RequestBody Map<String, Object> param) {
        return tcDetailService.findTcDetail(param);
    }
    @RequestMapping("/saveTcDetail.do")
    @ResponseBody
    public Map<String, Object> saveTcDetail(@RequestBody Map<String, Object> param) {
        return tcDetailService.saveTcDetail(param);
    }

    /* ═══ 담당자 (PCM_TGT_MANAGER) ═══ */
    @RequestMapping("/findListManager.do")
    @ResponseBody
    public List<Map<String, Object>> findListManager(@RequestBody Map<String, Object> param) {
        return tcDetailService.findList("Manager", param);
    }
    @RequestMapping("/saveListManager.do")
    @ResponseBody
    public Map<String, Object> saveListManager(@RequestBody Map<String, Object> param) {
        return tcDetailService.saveList("Manager", param);
    }
    @RequestMapping("/deleteListManager.do")
    @ResponseBody
    public Map<String, Object> deleteListManager(@RequestBody Map<String, Object> param) {
        return tcDetailService.deleteList("Manager", param);
    }

    /* ═══ 사양 (PCM_TGT_SPEC) ═══ */
    @RequestMapping("/findListSpec.do")
    @ResponseBody
    public List<Map<String, Object>> findListSpec(@RequestBody Map<String, Object> param) {
        return tcDetailService.findList("Spec", param);
    }
    @RequestMapping("/saveListSpec.do")
    @ResponseBody
    public Map<String, Object> saveListSpec(@RequestBody Map<String, Object> param) {
        return tcDetailService.saveList("Spec", param);
    }
    @RequestMapping("/deleteListSpec.do")
    @ResponseBody
    public Map<String, Object> deleteListSpec(@RequestBody Map<String, Object> param) {
        return tcDetailService.deleteList("Spec", param);
    }

    /* ═══ 판가 (PCM_TGT_PRICE) ═══ */
    @RequestMapping("/findListPrice.do")
    @ResponseBody
    public List<Map<String, Object>> findListPrice(@RequestBody Map<String, Object> param) {
        return tcDetailService.findList("Price", param);
    }
    @RequestMapping("/saveListPrice.do")
    @ResponseBody
    public Map<String, Object> saveListPrice(@RequestBody Map<String, Object> param) {
        return tcDetailService.saveList("Price", param);
    }
    @RequestMapping("/deleteListPrice.do")
    @ResponseBody
    public Map<String, Object> deleteListPrice(@RequestBody Map<String, Object> param) {
        return tcDetailService.deleteList("Price", param);
    }

    /* ═══ 수량/할인율 (PCM_TGT_QTY_DISC) ═══ */
    @RequestMapping("/findListQtyDisc.do")
    @ResponseBody
    public List<Map<String, Object>> findListQtyDisc(@RequestBody Map<String, Object> param) {
        return tcDetailService.findList("QtyDisc", param);
    }
    @RequestMapping("/saveListQtyDisc.do")
    @ResponseBody
    public Map<String, Object> saveListQtyDisc(@RequestBody Map<String, Object> param) {
        return tcDetailService.saveList("QtyDisc", param);
    }
    @RequestMapping("/deleteListQtyDisc.do")
    @ResponseBody
    public Map<String, Object> deleteListQtyDisc(@RequestBody Map<String, Object> param) {
        return tcDetailService.deleteList("QtyDisc", param);
    }

    /* ═══ 개발일정 (PCM_TGT_DEV_SCHEDULE) ═══ */
    @RequestMapping("/findListDevSchedule.do")
    @ResponseBody
    public List<Map<String, Object>> findListDevSchedule(@RequestBody Map<String, Object> param) {
        return tcDetailService.findList("DevSchedule", param);
    }
    @RequestMapping("/saveListDevSchedule.do")
    @ResponseBody
    public Map<String, Object> saveListDevSchedule(@RequestBody Map<String, Object> param) {
        return tcDetailService.saveList("DevSchedule", param);
    }
    @RequestMapping("/deleteListDevSchedule.do")
    @ResponseBody
    public Map<String, Object> deleteListDevSchedule(@RequestBody Map<String, Object> param) {
        return tcDetailService.deleteList("DevSchedule", param);
    }

    /* ═══ 양산일정 (PCM_TGT_SETUP_SCHEDULE) ═══ */
    @RequestMapping("/findListSetupSchedule.do")
    @ResponseBody
    public List<Map<String, Object>> findListSetupSchedule(@RequestBody Map<String, Object> param) {
        return tcDetailService.findList("SetupSchedule", param);
    }
    @RequestMapping("/saveListSetupSchedule.do")
    @ResponseBody
    public Map<String, Object> saveListSetupSchedule(@RequestBody Map<String, Object> param) {
        return tcDetailService.saveList("SetupSchedule", param);
    }
    @RequestMapping("/deleteListSetupSchedule.do")
    @ResponseBody
    public Map<String, Object> deleteListSetupSchedule(@RequestBody Map<String, Object> param) {
        return tcDetailService.deleteList("SetupSchedule", param);
    }

    /* ═══ 원가등록 (PCM_TGT_COST_REG) ═══ */
    @RequestMapping("/findListCostReg.do")
    @ResponseBody
    public List<Map<String, Object>> findListCostReg(@RequestBody Map<String, Object> param) {
        return tcDetailService.findList("CostReg", param);
    }
    @RequestMapping("/saveListCostReg.do")
    @ResponseBody
    public Map<String, Object> saveListCostReg(@RequestBody Map<String, Object> param) {
        return tcDetailService.saveList("CostReg", param);
    }
    @RequestMapping("/deleteListCostReg.do")
    @ResponseBody
    public Map<String, Object> deleteListCostReg(@RequestBody Map<String, Object> param) {
        return tcDetailService.deleteList("CostReg", param);
    }
    @RequestMapping("/generateTcCostReg.do")
    @ResponseBody
    public Map<String, Object> generateTcCostReg(@RequestBody Map<String, Object> param) {
        return tcDetailService.generateTcCostReg(param);
    }
    @RequestMapping("/confirmTcCostReg.do")
    @ResponseBody
    public Map<String, Object> confirmTcCostReg(@RequestBody Map<String, Object> param) {
        return tcDetailService.confirmTcCostReg(param);
    }

    /* ═══ 달성계획 (PCM_TGT_ACHV_PLAN) ═══ */
    @RequestMapping("/findListAchvPlan.do")
    @ResponseBody
    public List<Map<String, Object>> findListAchvPlan(@RequestBody Map<String, Object> param) {
        return tcDetailService.findList("AchvPlan", param);
    }
    @RequestMapping("/saveListAchvPlan.do")
    @ResponseBody
    public Map<String, Object> saveListAchvPlan(@RequestBody Map<String, Object> param) {
        return tcDetailService.saveList("AchvPlan", param);
    }
    @RequestMapping("/deleteListAchvPlan.do")
    @ResponseBody
    public Map<String, Object> deleteListAchvPlan(@RequestBody Map<String, Object> param) {
        return tcDetailService.deleteList("AchvPlan", param);
    }
    @RequestMapping("/generateTcAchvPlan.do")
    @ResponseBody
    public Map<String, Object> generateTcAchvPlan(@RequestBody Map<String, Object> param) {
        return tcDetailService.generateTcAchvPlan(param);
    }
    @RequestMapping("/confirmTcAchvPlan.do")
    @ResponseBody
    public Map<String, Object> confirmTcAchvPlan(@RequestBody Map<String, Object> param) {
        return tcDetailService.confirmTcAchvPlan(param);
    }

    /* ═══ 달성계획 상세 (PCM_TGT_ACHV_PLAN_DTL) ═══ */
    @RequestMapping("/findListAchvPlanDtl.do")
    @ResponseBody
    public List<Map<String, Object>> findListAchvPlanDtl(@RequestBody Map<String, Object> param) {
        return tcDetailService.findList("AchvPlanDtl", param);
    }
    @RequestMapping("/saveListAchvPlanDtl.do")
    @ResponseBody
    public Map<String, Object> saveListAchvPlanDtl(@RequestBody Map<String, Object> param) {
        return tcDetailService.saveList("AchvPlanDtl", param);
    }
    @RequestMapping("/deleteListAchvPlanDtl.do")
    @ResponseBody
    public Map<String, Object> deleteListAchvPlanDtl(@RequestBody Map<String, Object> param) {
        return tcDetailService.deleteList("AchvPlanDtl", param);
    }

    /* ═══ 재산출 (PCM_TGT_RECALC) ═══ */
    @RequestMapping("/findListRecalc.do")
    @ResponseBody
    public List<Map<String, Object>> findListRecalc(@RequestBody Map<String, Object> param) {
        return tcDetailService.findList("Recalc", param);
    }
    @RequestMapping("/saveListRecalc.do")
    @ResponseBody
    public Map<String, Object> saveListRecalc(@RequestBody Map<String, Object> param) {
        return tcDetailService.saveList("Recalc", param);
    }
    @RequestMapping("/deleteListRecalc.do")
    @ResponseBody
    public Map<String, Object> deleteListRecalc(@RequestBody Map<String, Object> param) {
        return tcDetailService.deleteList("Recalc", param);
    }

    /* ═══ 달성현황 (PCM_TGT_ACHV_STATUS) ═══ */
    @RequestMapping("/findListAchvStatus.do")
    @ResponseBody
    public List<Map<String, Object>> findListAchvStatus(@RequestBody Map<String, Object> param) {
        return tcDetailService.findList("AchvStatus", param);
    }
    @RequestMapping("/generateTcAchvStatus.do")
    @ResponseBody
    public Map<String, Object> generateTcAchvStatus(@RequestBody Map<String, Object> param) {
        return tcDetailService.generateTcAchvStatus(param);
    }
}
