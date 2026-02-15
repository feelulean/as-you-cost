package smartcost.app.bp.cost.currentcost;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Service;

/**
 * YHJY As-You-Cost — 달성도 평가 Repository
 *
 * - MyBatis SqlSession을 통해 데이터 접근 계층을 담당한다.
 * - Mapper XML namespace: smartcost.app.bp.cost.currentcost.AchievementEvalRepository
 */
@Service
public class AchievementEvalRepository {

    private static final String NAMESPACE = "smartcost.app.bp.cost.currentcost.AchievementEvalRepository.";

    @Inject
    private SqlSession sqlSession;

    /**
     * 달성도 평가 목록 조회
     */
    public List<Map<String, Object>> findListAchievementEval(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListAchievementEval", param);
    }

    /**
     * 달성도 평가 기초 데이터 조회 (EC/TC 다중 조인)
     * - 아직 평가 데이터가 없는 현상원가 프로젝트만 대상
     */
    public List<Map<String, Object>> findListAchievementEvalBase(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListAchievementEvalBase", param);
    }

    /**
     * 달성도 평가 신규 등록
     */
    public void insertAchievementEval(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertAchievementEval", param);
    }

    /**
     * 달성도 평가 수정 (현상원가 실적, 달성도 갱신)
     */
    public void updateAchievementEval(Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "updateAchievementEval", param);
    }

    /**
     * 달성도 평가 삭제
     */
    public void deleteAchievementEval(Map<String, Object> param) {
        sqlSession.delete(NAMESPACE + "deleteAchievementEval", param);
    }

    /**
     * 달성도 평가 존재 여부 확인
     */
    public int countAchievementEval(Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + "countAchievementEval", param);
    }
}
