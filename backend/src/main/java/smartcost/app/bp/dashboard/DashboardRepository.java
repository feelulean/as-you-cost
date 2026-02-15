package smartcost.app.bp.dashboard;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Service;

/**
 * 통합 통계 대시보드 Repository
 *
 * - MyBatis SqlSession을 통해 대시보드 통계 쿼리를 실행한다.
 * - Mapper XML namespace: smartcost.app.bp.dashboard.DashboardRepository
 */
@Service
public class DashboardRepository {

    private static final String NAMESPACE = "smartcost.app.bp.dashboard.DashboardRepository.";

    @Inject
    private SqlSession sqlSession;

    /**
     * KPI 요약 통계 조회
     */
    public Map<String, Object> findDashboardKpi(Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + "findDashboardKpi", param);
    }

    /**
     * 사업부별 원가 비중 조회 (Pie Chart)
     */
    public List<Map<String, Object>> findDashboardCostByBizUnit(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findDashboardCostByBizUnit", param);
    }

    /**
     * 사업부별 EC/TC/CC 원가 비교 (Bar Chart)
     */
    public List<Map<String, Object>> findDashboardCostComparison(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findDashboardCostComparison", param);
    }

    /**
     * 원가 절감 Top 5 프로젝트
     */
    public List<Map<String, Object>> findDashboardTop5Reduction(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findDashboardTop5Reduction", param);
    }
}
