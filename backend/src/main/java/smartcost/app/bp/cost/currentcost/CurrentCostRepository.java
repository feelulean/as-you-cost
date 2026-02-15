package smartcost.app.bp.cost.currentcost;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Service;

/**
 * 현상원가 프로젝트 관리 Repository
 *
 * - MyBatis SqlSession을 통해 데이터 접근 계층을 담당한다.
 * - Mapper XML namespace: smartcost.app.bp.cost.currentcost.CurrentCostRepository
 */
@Service
public class CurrentCostRepository {

    private static final String NAMESPACE = "smartcost.app.bp.cost.currentcost.CurrentCostRepository.";

    @Inject
    private SqlSession sqlSession;

    /**
     * 현상원가 프로젝트 목록 조회
     */
    public List<Map<String, Object>> findListCurrentCostPjt(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListCurrentCostPjt", param);
    }

    /**
     * 현상원가 프로젝트 코드 자동 채번
     * - 형식: CC + 연도(4자리) + 일련번호(4자리) (예: CC20260001)
     */
    public String findNewCurrentCostPjtCd() {
        return sqlSession.selectOne(NAMESPACE + "findNewCurrentCostPjtCd");
    }

    /**
     * 현상원가 프로젝트 신규 등록
     */
    public void insertCurrentCostPjt(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertCurrentCostPjt", param);
    }

    /**
     * 현상원가 진행상태 변경
     */
    public void updateCurrentCostProgSts(Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "updateCurrentCostProgSts", param);
    }

    /**
     * 현재 최대 현상차수(ccRev) 조회
     */
    public int findMaxCcRev(Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + "findMaxCcRev", param);
    }

    /**
     * 재산출 — 기존 차수 복사하여 신규 차수 생성
     */
    public void insertCurrentCostPjtByRecalc(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertCurrentCostPjtByRecalc", param);
    }
}
