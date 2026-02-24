package smartcost.app.bp.cost.ccdetail;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 현상원가 상세 관리 Controller
 * - 현상원가 등록의 탭(상세정보, 원가코드/판가, 수량/할인율, 담당자, 일정,
 *   BOM, BOM맵핑, 부품단가, 라인투자비, 라인투자비상세, 라인CT, 기타투자비,
 *   인원계획, 제조경비, 판매관리비, 손익계산서, 차이분석, 달성도평가상세,
 *   실적평가, 실적자재비)을 통합 관리
 */
@RestController
@RequestMapping("/bp/cost/cc/detail")
public class CcDetailController {

    @Inject
    private CcDetailService ccDetailService;

    /* ═══ 현상원가 상세 ═══ */
    @RequestMapping("/findCcDetail.do")
    public Map<String, Object> findCcDetail(@RequestBody Map<String, Object> param) {
        return ccDetailService.findCcDetail(param);
    }
    @RequestMapping("/saveCcDetail.do")
    public Map<String, Object> saveCcDetail(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveCcDetail(param);
    }

    /* ═══ 원가코드/판가 ═══ */
    @RequestMapping("/findListCostCode.do")
    public List<Map<String, Object>> findListCostCode(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("CostCode", param);
    }
    @RequestMapping("/saveListCostCode.do")
    public Map<String, Object> saveListCostCode(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("CostCode", param);
    }
    @RequestMapping("/deleteListCostCode.do")
    public Map<String, Object> deleteListCostCode(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("CostCode", param);
    }

    /* ═══ 수량/할인율 ═══ */
    @RequestMapping("/findListQtyDisc.do")
    public List<Map<String, Object>> findListQtyDisc(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("QtyDiscPivot", param);
    }
    @RequestMapping("/saveListQtyDisc.do")
    public Map<String, Object> saveListQtyDisc(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveQtyDisc(param);
    }

    /* ═══ 담당자 ═══ */
    @RequestMapping("/findListManager.do")
    public List<Map<String, Object>> findListManager(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("Manager", param);
    }
    @RequestMapping("/saveListManager.do")
    public Map<String, Object> saveListManager(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("Manager", param);
    }
    @RequestMapping("/deleteListManager.do")
    public Map<String, Object> deleteListManager(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("Manager", param);
    }

    /* ═══ 일정 ═══ */
    @RequestMapping("/findListSchedule.do")
    public List<Map<String, Object>> findListSchedule(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("Schedule", param);
    }
    @RequestMapping("/saveListSchedule.do")
    public Map<String, Object> saveListSchedule(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("Schedule", param);
    }
    @RequestMapping("/deleteListSchedule.do")
    public Map<String, Object> deleteListSchedule(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("Schedule", param);
    }

    /* ═══ BOM ═══ */
    @RequestMapping("/findListBom.do")
    public List<Map<String, Object>> findListBom(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("Bom", param);
    }
    @RequestMapping("/saveListBom.do")
    public Map<String, Object> saveListBom(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("Bom", param);
    }
    @RequestMapping("/deleteListBom.do")
    public Map<String, Object> deleteListBom(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("Bom", param);
    }

    /* ═══ BOM 맵핑 ═══ */
    @RequestMapping("/findListBomMap.do")
    public List<Map<String, Object>> findListBomMap(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("BomMap", param);
    }
    @RequestMapping("/saveListBomMap.do")
    public Map<String, Object> saveListBomMap(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("BomMap", param);
    }
    @RequestMapping("/deleteListBomMap.do")
    public Map<String, Object> deleteListBomMap(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("BomMap", param);
    }

    /* ═══ 부품단가 ═══ */
    @RequestMapping("/findListPartPrice.do")
    public List<Map<String, Object>> findListPartPrice(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("PartPrice", param);
    }
    @RequestMapping("/saveListPartPrice.do")
    public Map<String, Object> saveListPartPrice(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("PartPrice", param);
    }
    @RequestMapping("/deleteListPartPrice.do")
    public Map<String, Object> deleteListPartPrice(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("PartPrice", param);
    }

    /* ═══ 라인투자비 ═══ */
    @RequestMapping("/findListLineInvest.do")
    public List<Map<String, Object>> findListLineInvest(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("LineInvest", param);
    }
    @RequestMapping("/saveListLineInvest.do")
    public Map<String, Object> saveListLineInvest(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("LineInvest", param);
    }
    @RequestMapping("/deleteListLineInvest.do")
    public Map<String, Object> deleteListLineInvest(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("LineInvest", param);
    }

    /* ═══ 라인투자비 상세 ═══ */
    @RequestMapping("/findListLineInvestDtl.do")
    public List<Map<String, Object>> findListLineInvestDtl(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("LineInvestDtl", param);
    }
    @RequestMapping("/saveListLineInvestDtl.do")
    public Map<String, Object> saveListLineInvestDtl(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("LineInvestDtl", param);
    }
    @RequestMapping("/deleteListLineInvestDtl.do")
    public Map<String, Object> deleteListLineInvestDtl(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("LineInvestDtl", param);
    }

    /* ═══ 라인CT ═══ */
    @RequestMapping("/findListLineCt.do")
    public List<Map<String, Object>> findListLineCt(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("LineCt", param);
    }
    @RequestMapping("/saveListLineCt.do")
    public Map<String, Object> saveListLineCt(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("LineCt", param);
    }
    @RequestMapping("/deleteListLineCt.do")
    public Map<String, Object> deleteListLineCt(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("LineCt", param);
    }

    /* ═══ 기타투자비 ═══ */
    @RequestMapping("/findListOtherInvest.do")
    public List<Map<String, Object>> findListOtherInvest(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("OtherInvest", param);
    }
    @RequestMapping("/saveListOtherInvest.do")
    public Map<String, Object> saveListOtherInvest(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("OtherInvest", param);
    }
    @RequestMapping("/deleteListOtherInvest.do")
    public Map<String, Object> deleteListOtherInvest(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("OtherInvest", param);
    }

    /* ═══ 인원계획 ═══ */
    @RequestMapping("/findListManpower.do")
    public List<Map<String, Object>> findListManpower(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("Manpower", param);
    }
    @RequestMapping("/saveListManpower.do")
    public Map<String, Object> saveListManpower(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("Manpower", param);
    }
    @RequestMapping("/deleteListManpower.do")
    public Map<String, Object> deleteListManpower(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("Manpower", param);
    }

    /* ═══ 제조경비 ═══ */
    @RequestMapping("/findListMfgCost.do")
    public List<Map<String, Object>> findListMfgCost(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("MfgCost", param);
    }
    @RequestMapping("/saveMfgCost.do")
    public Map<String, Object> saveMfgCost(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("MfgCost", param);
    }
    @RequestMapping("/calculateMfgCost.do")
    public Map<String, Object> calculateMfgCost(@RequestBody Map<String, Object> param) {
        return ccDetailService.calculateMfgCost(param);
    }

    /* ═══ 판매관리비 ═══ */
    @RequestMapping("/findListSgaCost.do")
    public List<Map<String, Object>> findListSgaCost(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("SgaCost", param);
    }
    @RequestMapping("/saveSgaCost.do")
    public Map<String, Object> saveSgaCost(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("SgaCost", param);
    }
    @RequestMapping("/calculateSgaCost.do")
    public Map<String, Object> calculateSgaCost(@RequestBody Map<String, Object> param) {
        return ccDetailService.calculateSgaCost(param);
    }

    /* ═══ 손익계산서 ═══ */
    @RequestMapping("/findListPlStmt.do")
    public Map<String, Object> findListPlStmt(@RequestBody Map<String, Object> param) {
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("plList", ccDetailService.findListPlStmtPivot(param));
        return result;
    }
    @RequestMapping("/savePlStmt.do")
    public Map<String, Object> savePlStmt(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("PlStmt", param);
    }
    @RequestMapping("/calculatePlStmt.do")
    public Map<String, Object> calculatePlStmt(@RequestBody Map<String, Object> param) {
        return ccDetailService.calculatePlStmt(param);
    }

    /* ═══ 차이분석 ═══ */
    @RequestMapping("/findListDiffAnalysis.do")
    public List<Map<String, Object>> findListDiffAnalysis(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("DiffAnalysis", param);
    }
    @RequestMapping("/saveListDiffAnalysis.do")
    public Map<String, Object> saveListDiffAnalysis(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("DiffAnalysis", param);
    }
    @RequestMapping("/generateDiffAnalysis.do")
    public Map<String, Object> generateDiffAnalysis(@RequestBody Map<String, Object> param) {
        return ccDetailService.generateDiffAnalysis(param);
    }

    /* ═══ 달성도 평가 상세 ═══ */
    @RequestMapping("/findListAchvEvalDtl.do")
    public List<Map<String, Object>> findListAchvEvalDtl(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("AchvEvalDtl", param);
    }
    @RequestMapping("/saveListAchvEvalDtl.do")
    public Map<String, Object> saveListAchvEvalDtl(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("AchvEvalDtl", param);
    }
    @RequestMapping("/generateAchvEvalDtl.do")
    public Map<String, Object> generateAchvEvalDtl(@RequestBody Map<String, Object> param) {
        return ccDetailService.generateAchvEvalDtl(param);
    }

    /* ═══ 실적평가 ═══ */
    @RequestMapping("/findListActEval.do")
    public List<Map<String, Object>> findListActEval(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("ActEval", param);
    }
    @RequestMapping("/saveListActEval.do")
    public Map<String, Object> saveListActEval(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("ActEval", param);
    }
    @RequestMapping("/generateActEval.do")
    public Map<String, Object> generateActEval(@RequestBody Map<String, Object> param) {
        return ccDetailService.generateActEval(param);
    }

    /* ═══ 실적자재비 ═══ */
    @RequestMapping("/findListActMaterial.do")
    public List<Map<String, Object>> findListActMaterial(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("ActMaterial", param);
    }
    @RequestMapping("/saveListActMaterial.do")
    public Map<String, Object> saveListActMaterial(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("ActMaterial", param);
    }
    @RequestMapping("/deleteListActMaterial.do")
    public Map<String, Object> deleteListActMaterial(@RequestBody Map<String, Object> param) {
        return ccDetailService.deleteList("ActMaterial", param);
    }
    @RequestMapping("/calculateActMaterial.do")
    public Map<String, Object> calculateActMaterial(@RequestBody Map<String, Object> param) {
        return ccDetailService.calculateActMaterial(param);
    }

    /* ═══ 협의체구성 완료 (상세정보 상태변경) ═══ */
    @RequestMapping("/completeDetail.do")
    public Map<String, Object> completeDetail(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveCcDetail(param);
    }

    /* ═══ BOM 맵핑 - 대상/이전 조회 ═══ */
    @RequestMapping("/findListBomMapTarget.do")
    public List<Map<String, Object>> findListBomMapTarget(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("BomMap", param);
    }
    @RequestMapping("/findListBomMapPrev.do")
    public List<Map<String, Object>> findListBomMapPrev(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("BomMap", param);
    }

    /* ═══ 누적 차이분석 ═══ */
    @RequestMapping("/findListCumDiff.do")
    public List<Map<String, Object>> findListCumDiff(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("DiffAnalysis", param);
    }

    /* ═══ 달성도 평가 - 항목별 ═══ */
    @RequestMapping("/findListItemAchv.do")
    public List<Map<String, Object>> findListItemAchv(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("AchvEvalDtl", param);
    }
    @RequestMapping("/createItemAchv.do")
    public Map<String, Object> createItemAchv(@RequestBody Map<String, Object> param) {
        return ccDetailService.generateAchvEvalDtl(param);
    }
    @RequestMapping("/saveListItemAchv.do")
    public Map<String, Object> saveListItemAchv(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("AchvEvalDtl", param);
    }

    /* ═══ 목표원가코드 목록 (실적평가용) ═══ */
    @RequestMapping("/findListTgtCostCode.do")
    public List<Map<String, Object>> findListTgtCostCode(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("CostCode", param);
    }

    /* ═══ 실적 부품 목록 ═══ */
    @RequestMapping("/findListActPart.do")
    public List<Map<String, Object>> findListActPart(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("PartPrice", param);
    }
    @RequestMapping("/saveListActPart.do")
    public Map<String, Object> saveListActPart(@RequestBody Map<String, Object> param) {
        return ccDetailService.saveList("PartPrice", param);
    }

    /* ═══ 원가그룹 목록 (손익계산서용) ═══ */
    @RequestMapping("/findListCostGrp.do")
    public List<Map<String, Object>> findListCostGrp(@RequestBody Map<String, Object> param) {
        return ccDetailService.findList("CostCode", param);
    }
}
