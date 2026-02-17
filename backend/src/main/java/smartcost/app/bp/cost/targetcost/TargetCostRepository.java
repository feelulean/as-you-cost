package smartcost.app.bp.cost.targetcost;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Service;

/**
 * 목표원가 프로젝트 관리 Repository
 *
 * - MyBatis SqlSession을 통해 데이터 접근 계층을 담당한다.
 * - Mapper XML namespace: smartcost.app.bp.cost.targetcost.TargetCostRepository
 */
@Service
public class TargetCostRepository {

    private static final String NAMESPACE = "smartcost.app.bp.cost.targetcost.TargetCostRepository.";

    @Inject
    private SqlSession sqlSession;

    /**
     * 목표원가 프로젝트 목록 조회
     */
    public List<Map<String, Object>> findListTargetCostPjt(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListTargetCostPjt", param);
    }

    /**
     * 목표원가 프로젝트 코드 자동 채번
     * - 형식: TC + 연도(4자리) + 일련번호(4자리) (예: TC20260001)
     */
    public String findNewTargetCostPjtCd(Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + "findNewTargetCostPjtCd", param);
    }

    /**
     * 목표원가 프로젝트 신규 등록
     */
    public void insertTargetCostPjt(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertTargetCostPjt", param);
    }

    /**
     * 목표원가 프로젝트 수정
     */
    public void updateTargetCostPjt(Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "updateTargetCostPjt", param);
    }

    /**
     * 목표원가 프로젝트 삭제
     */
    public void deleteTargetCostPjt(Map<String, Object> param) {
        sqlSession.delete(NAMESPACE + "deleteTargetCostPjt", param);
    }
}
