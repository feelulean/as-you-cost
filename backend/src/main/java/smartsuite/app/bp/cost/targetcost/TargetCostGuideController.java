package smartsuite.app.bp.cost.targetcost;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * 목표원가 부문별 Guide 산출 Controller
 *
 * - 부문별 목표 Guide 조회, 산출, 저장을 처리한다.
 * - 화면 ID: es-target-cost-guide-list
 */
@Controller
@RequestMapping("/bp/cost/tc/guide")
public class TargetCostGuideController {

    @Inject
    private TargetCostGuideService targetCostGuideService;

    /**
     * 부문별 목표 Guide 목록 조회
     *
     * @param param 조회 조건 (tgtPjtCd, bizUnit, prodGrp, oemNm, carType, specDesc)
     * @return Guide 목록
     */
    @RequestMapping("/findListTargetCostGuide.do")
    @ResponseBody
    public List<Map<String, Object>> findListTargetCostGuide(@RequestBody Map<String, Object> param) {
        return targetCostGuideService.findListTargetCostGuide(param);
    }

    /**
     * 부문별 목표 Guide 산출 (TC03)
     *
     * 견적/현상원가를 기준으로 목표수익률을 적용하여
     * 부문별 목표 절감 Guide 금액을 자동 산출한다.
     *
     * @param param 산출 대상 프로젝트 정보 (tgtPjtCd)
     * @return 산출된 Guide 목록
     */
    @RequestMapping("/calculateTargetGuide.do")
    @ResponseBody
    public List<Map<String, Object>> calculateTargetGuide(@RequestBody Map<String, Object> param) {
        return targetCostGuideService.calculateTargetGuide(param);
    }

    /**
     * 부문별 목표 Guide 저장
     *
     * @param param tgtPjtCd + saveList
     * @return 처리 결과
     */
    @RequestMapping("/saveListTargetCostGuide.do")
    @ResponseBody
    public Map<String, Object> saveListTargetCostGuide(@RequestBody Map<String, Object> param) {
        return targetCostGuideService.saveListTargetCostGuide(param);
    }
}
