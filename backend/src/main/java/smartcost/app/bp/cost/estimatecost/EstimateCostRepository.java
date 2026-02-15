package smartcost.app.bp.cost.estimatecost;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Service;

/**
 * 견적원가 프로젝트 관리 Repository
 *
 * - MyBatis SqlSession을 통해 데이터 접근 계층을 담당한다.
 * - Mapper XML namespace: smartcost.app.bp.cost.estimatecost.EstimateCostRepository
 */
@Service
public class EstimateCostRepository {

    private static final String NAMESPACE = "smartcost.app.bp.cost.estimatecost.EstimateCostRepository.";

    @Inject
    private SqlSession sqlSession;

    /**
     * 견적원가 프로젝트 목록 조회
     */
    public List<Map<String, Object>> findListEstimateCostPjt(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListEstimateCostPjt", param);
    }

    /**
     * 견적원가 프로젝트 코드 자동 채번
     * - 형식: EC + 연도(4자리) + 일련번호(4자리) (예: EC20260001)
     */
    public String findNewEstimateCostPjtCd(Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + "findNewEstimateCostPjtCd", param);
    }

    /**
     * 견적원가 프로젝트 신규 등록
     */
    public void insertEstimateCostPjt(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertEstimateCostPjt", param);
    }

    /**
     * 견적원가 프로젝트 수정
     */
    public void updateEstimateCostPjt(Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "updateEstimateCostPjt", param);
    }

    /**
     * 견적원가 프로젝트 삭제
     */
    public void deleteEstimateCostPjt(Map<String, Object> param) {
        sqlSession.delete(NAMESPACE + "deleteEstimateCostPjt", param);
    }
}
