package smartcost.app.bp.cost.currentcost;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * YHJY As-You-Cost — 달성도 평가 Controller
 *
 * - 현상원가 프로젝트별 목표원가 대비 달성도 평가 CRUD를 처리한다.
 * - 화면 ID: es-achievement-eval-list
 * - URL prefix: /bp/cost/cc/achv
 */
@RestController
@RequestMapping("/bp/cost/cc/achv")
public class AchievementEvalController {

    @Inject
    private AchievementEvalService achievementEvalService;

    /**
     * 달성도 평가 목록 조회
     *
     * @param param 조회 조건 (curPjtCd, bizUnit, custNm, achvYn)
     * @return 달성도 평가 목록
     */
    @RequestMapping("/findListAchievementEval.do")
    public List<Map<String, Object>> findListAchievementEval(@RequestBody Map<String, Object> param) {
        return achievementEvalService.findListAchievementEval(param);
    }

    /**
     * 달성도 평가 데이터 생성
     * - EC(견적원가), TC(목표원가) 테이블을 조인하여 기초 데이터를 자동 구성
     *
     * @param param 조건 없음 (전체 프로젝트 대상)
     * @return 생성된 건수
     */
    @RequestMapping("/createAchievementEval.do")
    public Map<String, Object> createAchievementEval(@RequestBody Map<String, Object> param) {
        return achievementEvalService.createAchievementEval(param);
    }

    /**
     * 달성도 평가 저장 (현상원가 실적 입력, 달성도 갱신)
     *
     * @param param saveList: [{curPjtCd, curTotalCost, ...}]
     * @return 처리 결과
     */
    @RequestMapping("/saveListAchievementEval.do")
    public Map<String, Object> saveListAchievementEval(@RequestBody Map<String, Object> param) {
        return achievementEvalService.saveListAchievementEval(param);
    }

    /**
     * 달성도 평가 삭제
     *
     * @param param deleteList: [{curPjtCd}]
     * @return 처리 결과
     */
    @RequestMapping("/deleteListAchievementEval.do")
    public Map<String, Object> deleteListAchievementEval(@RequestBody Map<String, Object> param) {
        return achievementEvalService.deleteListAchievementEval(param);
    }
}
