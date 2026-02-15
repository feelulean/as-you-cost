package smartcost.app.bp.cost.targetcost;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Service;

/**
 * 목표원가 부문별 Guide Repository
 *
 * - MyBatis SqlSession을 통해 데이터 접근 계층을 담당한다.
 * - Mapper XML namespace: smartcost.app.bp.cost.targetcost.TargetCostGuideRepository
 */
@Service
public class TargetCostGuideRepository {

    private static final String NAMESPACE = "smartcost.app.bp.cost.targetcost.TargetCostGuideRepository.";

    @Inject
    private SqlSession sqlSession;

    /**
     * 부문별 목표 Guide 목록 조회
     */
    public List<Map<String, Object>> findListTargetCostGuide(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListTargetCostGuide", param);
    }

    /**
     * 목표원가 프로젝트 기본 정보 조회 (목표수익률, 판가, 수량, 연계 견적코드)
     */
    public Map<String, Object> findTargetCostPjtInfo(Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + "findTargetCostPjtInfo", param);
    }

    /**
     * 견적/현상원가 부문별 원가 데이터 조회
     * - 연계된 견적코드(EC_PJT_CD)의 부문별 원가 내역을 가져온다.
     */
    public List<Map<String, Object>> findListEstimateCostByPjt(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListEstimateCostByPjt", param);
    }

    /**
     * 부문별 Guide 신규 등록
     */
    public void insertTargetCostGuide(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertTargetCostGuide", param);
    }

    /**
     * 부문별 Guide 수정
     */
    public void updateTargetCostGuide(Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "updateTargetCostGuide", param);
    }

    /**
     * 프로젝트 기준 Guide 전체 삭제 (재산출 시 사용)
     */
    public void deleteTargetCostGuideByPjt(Map<String, Object> param) {
        sqlSession.delete(NAMESPACE + "deleteTargetCostGuideByPjt", param);
    }
}
