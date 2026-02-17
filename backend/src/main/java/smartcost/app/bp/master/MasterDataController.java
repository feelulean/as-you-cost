package smartcost.app.bp.master;

import java.util.List;
import java.util.Map;
import javax.inject.Inject;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bp/master/data")
public class MasterDataController {

    @Inject
    private MasterDataService masterDataService;

    // ── 법인세율 ──
    @RequestMapping("/findListCorpTax.do")
    public List<Map<String, Object>> findListCorpTax(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("corpTax", param);
    }
    @RequestMapping("/saveListCorpTax.do")
    public Map<String, Object> saveListCorpTax(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("corpTax", param);
    }
    @RequestMapping("/deleteListCorpTax.do")
    public Map<String, Object> deleteListCorpTax(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("corpTax", param);
    }

    // ── CRP ──
    @RequestMapping("/findListCrp.do")
    public List<Map<String, Object>> findListCrp(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("crp", param);
    }
    @RequestMapping("/saveListCrp.do")
    public Map<String, Object> saveListCrp(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("crp", param);
    }
    @RequestMapping("/deleteListCrp.do")
    public Map<String, Object> deleteListCrp(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("crp", param);
    }

    // ── Betau ──
    @RequestMapping("/findListBetau.do")
    public List<Map<String, Object>> findListBetau(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("betau", param);
    }
    @RequestMapping("/saveListBetau.do")
    public Map<String, Object> saveListBetau(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("betau", param);
    }
    @RequestMapping("/deleteListBetau.do")
    public Map<String, Object> deleteListBetau(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("betau", param);
    }

    // ── 생산라인 ──
    @RequestMapping("/findListProdLine.do")
    public List<Map<String, Object>> findListProdLine(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("prodLine", param);
    }
    @RequestMapping("/saveListProdLine.do")
    public Map<String, Object> saveListProdLine(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("prodLine", param);
    }
    @RequestMapping("/deleteListProdLine.do")
    public Map<String, Object> deleteListProdLine(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("prodLine", param);
    }

    // ── 손익 항목 ──
    @RequestMapping("/findListPlItem.do")
    public List<Map<String, Object>> findListPlItem(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("plItem", param);
    }
    @RequestMapping("/saveListPlItem.do")
    public Map<String, Object> saveListPlItem(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("plItem", param);
    }
    @RequestMapping("/deleteListPlItem.do")
    public Map<String, Object> deleteListPlItem(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("plItem", param);
    }

    // ── 사업 실적 비율 ──
    @RequestMapping("/findListBizPerfRate.do")
    public List<Map<String, Object>> findListBizPerfRate(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("bizPerfRate", param);
    }
    @RequestMapping("/saveListBizPerfRate.do")
    public Map<String, Object> saveListBizPerfRate(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("bizPerfRate", param);
    }
    @RequestMapping("/deleteListBizPerfRate.do")
    public Map<String, Object> deleteListBizPerfRate(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("bizPerfRate", param);
    }

    // ── 환율 ──
    @RequestMapping("/findListExchRate.do")
    public List<Map<String, Object>> findListExchRate(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("exchRate", param);
    }
    @RequestMapping("/saveListExchRate.do")
    public Map<String, Object> saveListExchRate(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("exchRate", param);
    }
    @RequestMapping("/deleteListExchRate.do")
    public Map<String, Object> deleteListExchRate(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("exchRate", param);
    }
    @RequestMapping("/findExchRateByPair.do")
    public Map<String, Object> findExchRateByPair(@RequestBody Map<String, Object> param) {
        return masterDataService.findExchRateByPair(param);
    }

    // ── 인상율 ──
    @RequestMapping("/findListRaiseRate.do")
    public List<Map<String, Object>> findListRaiseRate(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("raiseRate", param);
    }
    @RequestMapping("/saveListRaiseRate.do")
    public Map<String, Object> saveListRaiseRate(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("raiseRate", param);
    }
    @RequestMapping("/deleteListRaiseRate.do")
    public Map<String, Object> deleteListRaiseRate(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("raiseRate", param);
    }

    // ── 표준 일정 ──
    @RequestMapping("/findListStdSchedule.do")
    public List<Map<String, Object>> findListStdSchedule(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("stdSchedule", param);
    }
    @RequestMapping("/saveListStdSchedule.do")
    public Map<String, Object> saveListStdSchedule(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("stdSchedule", param);
    }
    @RequestMapping("/deleteListStdSchedule.do")
    public Map<String, Object> deleteListStdSchedule(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("stdSchedule", param);
    }

    // ── 원가 절감 활동 유형 ──
    @RequestMapping("/findListCostReduType.do")
    public List<Map<String, Object>> findListCostReduType(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("costReduType", param);
    }
    @RequestMapping("/saveListCostReduType.do")
    public Map<String, Object> saveListCostReduType(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("costReduType", param);
    }
    @RequestMapping("/deleteListCostReduType.do")
    public Map<String, Object> deleteListCostReduType(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("costReduType", param);
    }

    // ── ERP 제조원가 계정 매핑 ──
    @RequestMapping("/findListErpAcctMap.do")
    public List<Map<String, Object>> findListErpAcctMap(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("erpAcctMap", param);
    }
    @RequestMapping("/saveListErpAcctMap.do")
    public Map<String, Object> saveListErpAcctMap(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("erpAcctMap", param);
    }
    @RequestMapping("/deleteListErpAcctMap.do")
    public Map<String, Object> deleteListErpAcctMap(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("erpAcctMap", param);
    }

    // ── 절감대상 원가항목 및 담당부서 ──
    @RequestMapping("/findListReduTgtDept.do")
    public List<Map<String, Object>> findListReduTgtDept(@RequestBody Map<String, Object> param) {
        return masterDataService.findList("reduTgtDept", param);
    }
    @RequestMapping("/saveListReduTgtDept.do")
    public Map<String, Object> saveListReduTgtDept(@RequestBody Map<String, Object> param) {
        return masterDataService.saveList("reduTgtDept", param);
    }
    @RequestMapping("/deleteListReduTgtDept.do")
    public Map<String, Object> deleteListReduTgtDept(@RequestBody Map<String, Object> param) {
        return masterDataService.deleteList("reduTgtDept", param);
    }
}
