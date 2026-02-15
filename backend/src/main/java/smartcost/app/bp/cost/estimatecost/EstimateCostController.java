package smartcost.app.bp.cost.estimatecost;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 견적원가 프로젝트 관리 Controller
 *
 * - 견적원가(EC) 프로젝트 조회, 저장, 삭제를 처리한다.
 * - 화면 ID: es-project-list
 * - EC 프로세스: EC01(RFQ등록) → EC02(대상선정) → EC07(수주관리)
 */
@RestController
@RequestMapping("/bp/cost/ec")
public class EstimateCostController {

    @Inject
    private EstimateCostService estimateCostService;

    /**
     * 견적원가 프로젝트 목록 조회
     *
     * @param param 조회 조건 (pjtCd, bizUnit, custNm, carType)
     * @return 견적원가 프로젝트 목록
     */
    @RequestMapping("/findListEstimateCostPjt.do")
    public List<Map<String, Object>> findListEstimateCostPjt(@RequestBody Map<String, Object> param) {
        return estimateCostService.findListEstimateCostPjt(param);
    }

    /**
     * 견적원가 프로젝트 목록 저장 (신규 등록 및 수정)
     *
     * @param param saveList: 저장 대상 목록
     * @return 처리 결과
     */
    @RequestMapping("/saveListEstimateCostPjt.do")
    public Map<String, Object> saveListEstimateCostPjt(@RequestBody Map<String, Object> param) {
        return estimateCostService.saveListEstimateCostPjt(param);
    }

    /**
     * 견적원가 프로젝트 목록 삭제
     *
     * @param param deleteList: 삭제 대상 목록
     * @return 처리 결과
     */
    @RequestMapping("/deleteListEstimateCostPjt.do")
    public Map<String, Object> deleteListEstimateCostPjt(@RequestBody Map<String, Object> param) {
        return estimateCostService.deleteListEstimateCostPjt(param);
    }
}
