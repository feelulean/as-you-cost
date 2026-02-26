package smartcost.app.bp.cost.ecdetail;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Service;

/**
 * 견적원가 상세 기능 Repository
 * - 동적 엔티티명으로 MyBatis 매퍼 호출을 일반화한다.
 */
@Service
public class EcDetailRepository {

    private static final String NAMESPACE = "smartcost.app.bp.cost.ecdetail.EcDetailRepository.";

    @Inject
    private SqlSession sqlSession;

    /* ── 범용 목록 조회 ── */
    public List<Map<String, Object>> findList(String entity, Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findList" + entity, param);
    }

    /* ── 범용 단건 조회 ── */
    public Map<String, Object> findOne(String entity, Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + "find" + entity, param);
    }

    /* ── 범용 Insert ── */
    public void insert(String entity, Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insert" + entity, param);
    }

    /* ── 범용 Update ── */
    public void update(String entity, Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "update" + entity, param);
    }

    /* ── 범용 Delete ── */
    public void delete(String entity, Map<String, Object> param) {
        sqlSession.delete(NAMESPACE + "delete" + entity, param);
    }

    /* ── 존재 여부 확인 ── */
    public int count(String entity, Map<String, Object> param) {
        Integer cnt = sqlSession.selectOne(NAMESPACE + "count" + entity, param);
        return cnt != null ? cnt : 0;
    }

    /* ── 프로젝트 단위 삭제 (delete{Entity}ByPjt) ── */
    public void deleteByPjt(String entity, Map<String, Object> param) {
        sqlSession.delete(NAMESPACE + "delete" + entity + "ByPjt", param);
    }

    /* ── 손익계산서 산출 INSERT (집계 쿼리) ── */
    public void insertCalcPlStmt(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertCalcPlStmt", param);
    }

    /* ── 손익계산서 원가그룹(GRP) 레벨 INSERT ── */
    public void insertCalcPlStmtGrp(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertCalcPlStmtGrp", param);
    }

    /* ── 손익계산서 원가코드(CODE) 레벨 INSERT ── */
    public void insertCalcPlStmtCode(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertCalcPlStmtCode", param);
    }

    /* ── 손익계산서 피벗 조회 ── */
    public List<Map<String, Object>> findListPlStmtPivot(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListPlStmtPivot", param);
    }
}
