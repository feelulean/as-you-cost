package smartcost.app.bp.dashboard;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Service;

/**
 * 통합 통계 대시보드 Service
 *
 * - 4개의 통계 쿼리를 호출하여 하나의 응답으로 조합한다.
 *   1) KPI 요약 (총 프로젝트 수, 평균 달성률, 위험 프로젝트)
 *   2) 사업부별 원가 비중 (Pie Chart)
 *   3) 사업부별 EC/TC/CC 비교 (Bar Chart)
 *   4) 원가 절감 Top 5
 */
@Service
public class DashboardService {

    @Inject
    private DashboardRepository dashboardRepository;

    /**
     * 대시보드 통계 데이터 일괄 조회
     *
     * @param param 빈 Map (글로벌 파라미터 AOP 래핑 대상)
     * @return kpi, costByBizUnit, costComparison, top5Reduction
     */
    public Map<String, Object> findDashboardStat(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();

        // 1) KPI 요약
        Map<String, Object> kpi = dashboardRepository.findDashboardKpi(param);
        result.put("kpi", kpi);

        // 2) 사업부별 원가 비중
        List<Map<String, Object>> costByBizUnit = dashboardRepository.findDashboardCostByBizUnit(param);
        result.put("costByBizUnit", costByBizUnit);

        // 3) 사업부별 EC/TC/CC 비교
        List<Map<String, Object>> costComparison = dashboardRepository.findDashboardCostComparison(param);
        result.put("costComparison", costComparison);

        // 4) 원가 절감 Top 5
        List<Map<String, Object>> top5 = dashboardRepository.findDashboardTop5Reduction(param);
        result.put("top5Reduction", top5);

        return result;
    }
}
