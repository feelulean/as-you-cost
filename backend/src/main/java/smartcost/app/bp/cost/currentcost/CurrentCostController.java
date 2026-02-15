package smartcost.app.bp.cost.currentcost;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 현상원가 프로젝트 관리 Controller
 *
 * - 현상원가(Current Cost) 프로젝트 조회, 저장, 상태변경, 재산출을 처리한다.
 * - 화면 ID: es-current-cost-project-list
 * - 견적원가(EC) 확정 후 이관된 데이터를 기반으로 현상원가를 관리한다.
 */
@RestController
@RequestMapping("/bp/cost/cc")
public class CurrentCostController {

    @Inject
    private CurrentCostService currentCostService;

    /**
     * 현상원가 프로젝트 목록 조회
     *
     * @param param 조회 조건 (pjtCd, bizUnit, custNm, carType)
     * @return 현상원가 프로젝트 목록
     */
    @RequestMapping("/findListCurrentCostPjt.do")
    public List<Map<String, Object>> findListCurrentCostPjt(@RequestBody Map<String, Object> param) {
        return currentCostService.findListCurrentCostPjt(param);
    }

    /**
     * 현상원가 프로젝트 저장 (신규 등록 — EC에서 이관)
     *
     * @param param 견적원가 연계 정보 (ecPjtCd, pjtNm, bizUnit 등)
     * @return 처리 결과
     */
    @RequestMapping("/saveCurrentCostPjt.do")
    public Map<String, Object> saveCurrentCostPjt(@RequestBody Map<String, Object> param) {
        return currentCostService.saveCurrentCostPjt(param);
    }

    /**
     * 현상원가 프로젝트 진행상태 변경
     *
     * @param param 대상 프로젝트 (pjtCd, ccRev, progSts)
     * @return 처리 결과
     */
    @RequestMapping("/changeStatusCurrentCostPjt.do")
    public Map<String, Object> changeStatusCurrentCostPjt(@RequestBody Map<String, Object> param) {
        return currentCostService.changeStatusCurrentCostPjt(param);
    }

    /**
     * 현상원가 재산출 (현상차수 증가)
     *
     * @param param 대상 프로젝트 (pjtCd, ccRev)
     * @return 처리 결과
     */
    @RequestMapping("/recalculateCurrentCostPjt.do")
    public Map<String, Object> recalculateCurrentCostPjt(@RequestBody Map<String, Object> param) {
        return currentCostService.recalculateCurrentCostPjt(param);
    }
}
