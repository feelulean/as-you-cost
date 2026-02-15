package smartcost.app.bp.cost.ecprofit;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 견적원가 수익성 분석 Controller
 *
 * - 견적기준가 취합 및 WACC 기반 수익성 분석 데이터를 관리한다.
 * - 화면 ID: es-ec-profit-mgt
 * - EC05/EC06 프로세스: 견적원가 마감 및 수익성 분석
 */
@RestController
@RequestMapping("/bp/cost/ec/profit")
public class EcProfitController {

    @Inject
    private EcProfitService ecProfitService;

    /**
     * 프로젝트 목록 조회 (좌측 그리드용 — 견적원가 마스터)
     */
    @RequestMapping("/findListEcPjtForProfit.do")
    public List<Map<String, Object>> findListEcPjtForProfit(@RequestBody Map<String, Object> param) {
        return ecProfitService.findListEcPjtForProfit(param);
    }

    /**
     * 수익성 분석 데이터 조회 (우측 폼)
     */
    @RequestMapping("/findEcProfit.do")
    public Map<String, Object> findEcProfit(@RequestBody Map<String, Object> param) {
        return ecProfitService.findEcProfit(param);
    }

    /**
     * BOM 재료비 집계 (PCM_EC_BOM → SUM(MAT_COST))
     */
    @RequestMapping("/aggregateMaterialCost.do")
    public Map<String, Object> aggregateMaterialCost(@RequestBody Map<String, Object> param) {
        return ecProfitService.aggregateMaterialCost(param);
    }

    /**
     * 수익성 분석 데이터 저장 (Insert or Update)
     */
    @RequestMapping("/saveEcProfit.do")
    public Map<String, Object> saveEcProfit(@RequestBody Map<String, Object> param) {
        return ecProfitService.saveEcProfit(param);
    }
}
