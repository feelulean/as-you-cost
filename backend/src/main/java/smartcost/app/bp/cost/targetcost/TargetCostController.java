package smartcost.app.bp.cost.targetcost;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * 목표원가 프로젝트 관리 Controller
 *
 * - 목표원가 프로젝트 조회, 저장, 삭제를 처리한다.
 * - 화면 ID: es-target-cost-project-list
 */
@Controller
@RequestMapping("/bp/cost/tc")
public class TargetCostController {

    @Inject
    private TargetCostService targetCostService;

    /**
     * 목표원가 프로젝트 목록 조회
     *
     * @param param 조회 조건 (pjtCd, bizUnit, custNm, carType)
     * @return 목표원가 프로젝트 목록
     */
    @RequestMapping("/findListTargetCostPjt.do")
    @ResponseBody
    public List<Map<String, Object>> findListTargetCostPjt(@RequestBody Map<String, Object> param) {
        return targetCostService.findListTargetCostPjt(param);
    }

    /**
     * 목표원가 프로젝트 목록 저장 (신규 등록 및 수정)
     *
     * @param param saveList: 저장 대상 목록
     * @return 처리 결과
     */
    @RequestMapping("/saveListTargetCostPjt.do")
    @ResponseBody
    public Map<String, Object> saveListTargetCostPjt(@RequestBody Map<String, Object> param) {
        return targetCostService.saveListTargetCostPjt(param);
    }

    /**
     * 목표원가 프로젝트 목록 삭제
     *
     * @param param deleteList: 삭제 대상 목록
     * @return 처리 결과
     */
    @RequestMapping("/deleteListTargetCostPjt.do")
    @ResponseBody
    public Map<String, Object> deleteListTargetCostPjt(@RequestBody Map<String, Object> param) {
        return targetCostService.deleteListTargetCostPjt(param);
    }
}
