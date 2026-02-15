package smartcost.app.bp.dashboard;

import java.util.Map;

import javax.inject.Inject;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 통합 통계 대시보드 Controller
 *
 * - 대시보드 화면(Welcome)에서 호출하는 통계 API
 * - 단일 API로 KPI, 차트, Top5 데이터를 일괄 응답한다.
 */
@RestController
@RequestMapping("/bp/dashboard")
public class DashboardController {

    @Inject
    private DashboardService dashboardService;

    /**
     * 대시보드 통계 데이터 조회
     *
     * @param param 빈 Map (AOP에서 글로벌 파라미터 자동 주입)
     * @return { kpi, costByBizUnit, costComparison, top5Reduction }
     */
    @RequestMapping("/findDashboardStat.do")
    public Map<String, Object> findDashboardStat(@RequestBody Map<String, Object> param) {
        return dashboardService.findDashboardStat(param);
    }
}
