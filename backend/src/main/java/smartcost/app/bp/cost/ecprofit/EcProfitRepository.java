package smartcost.app.bp.cost.ecprofit;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Service;

/**
 * 견적원가 수익성 분석 Repository
 *
 * - MyBatis SqlSession을 통해 수익성 분석 데이터 접근 계층을 담당한다.
 * - Mapper XML namespace: smartcost.app.bp.cost.ecprofit.EcProfitRepository
 */
@Service
public class EcProfitRepository {

    private static final String NAMESPACE = "smartcost.app.bp.cost.ecprofit.EcProfitRepository.";

    @Inject
    private SqlSession sqlSession;

    /**
     * 프로젝트 목록 조회 (견적원가 마스터)
     */
    public List<Map<String, Object>> findListEcPjtForProfit(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListEcPjtForProfit", param);
    }

    /**
     * 수익성 분석 데이터 단건 조회
     */
    public Map<String, Object> findEcProfit(Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + "findEcProfit", param);
    }

    /**
     * 수익성 데이터 존재 여부 확인
     */
    public int countEcProfit(Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + "countEcProfit", param);
    }

    /**
     * BOM 재료비 집계 (PCM_EC_BOM → SUM(MAT_COST))
     */
    public BigDecimal aggregateMaterialCost(Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + "aggregateMaterialCost", param);
    }

    /**
     * 수익성 분석 데이터 신규 등록
     */
    public void insertEcProfit(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertEcProfit", param);
    }

    /**
     * 수익성 분석 데이터 수정
     */
    public void updateEcProfit(Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "updateEcProfit", param);
    }
}
