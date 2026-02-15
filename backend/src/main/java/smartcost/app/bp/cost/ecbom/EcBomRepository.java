package smartcost.app.bp.cost.ecbom;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Service;

/**
 * 견적BOM 관리 Repository
 *
 * - MyBatis SqlSession을 통해 BOM 데이터 접근 계층을 담당한다.
 * - Mapper XML namespace: smartcost.app.bp.cost.ecbom.EcBomRepository
 */
@Service
public class EcBomRepository {

    private static final String NAMESPACE = "smartcost.app.bp.cost.ecbom.EcBomRepository.";

    @Inject
    private SqlSession sqlSession;

    /**
     * 견적BOM 목록 조회 (계층 정렬 — WITH RECURSIVE)
     */
    public List<Map<String, Object>> findListEcBom(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListEcBom", param);
    }

    /**
     * 견적BOM 신규 등록 (단건)
     */
    public void insertEcBom(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertEcBom", param);
    }

    /**
     * 프로젝트 기준 BOM 전체 삭제 (Delete-Insert 용)
     */
    public void deleteEcBomByPjt(Map<String, Object> param) {
        sqlSession.delete(NAMESPACE + "deleteEcBomByPjt", param);
    }

    /**
     * 선택 품목 + 하위 품목 재귀 삭제
     */
    public void deleteEcBomWithChildren(Map<String, Object> param) {
        sqlSession.delete(NAMESPACE + "deleteEcBomWithChildren", param);
    }

    /**
     * 모든 부품의 개별 재료비 갱신 (qty × unitPrice)
     */
    public void updateAllMatCost(Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "updateAllMatCost", param);
    }

    /**
     * 상위 품목에 하위 재료비 합계 누적
     */
    public void updateParentMatCost(Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "updateParentMatCost", param);
    }

    /**
     * 총 재료비 조회 (최상위 품목 합계)
     */
    public BigDecimal findTotalMatCost(Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + "findTotalMatCost", param);
    }

    /**
     * 기존단가 일괄 업데이트 (단가 + 재료비 재산출)
     */
    public void updateBatchEcBomPrice(Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "updateBatchEcBomPrice", param);
    }
}
