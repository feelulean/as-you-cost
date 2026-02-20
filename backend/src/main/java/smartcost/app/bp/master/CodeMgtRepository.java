package smartcost.app.bp.master;

import java.util.List;
import java.util.Map;
import javax.inject.Inject;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Service;

@Service
public class CodeMgtRepository {

    private static final String NAMESPACE = "smartcost.app.bp.master.CodeMgtRepository.";

    @Inject
    private SqlSession sqlSession;

    public List<Map<String, Object>> findListGrpCd(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListGrpCd", param);
    }

    public void insertGrpCd(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertGrpCd", param);
    }

    public void updateGrpCd(Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "updateGrpCd", param);
    }

    public List<Map<String, Object>> findListDtlCd(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListDtlCd", param);
    }

    public void insertDtlCd(Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insertDtlCd", param);
    }

    public void updateDtlCd(Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "updateDtlCd", param);
    }

    public void deleteDtlCd(Map<String, Object> param) {
        sqlSession.delete(NAMESPACE + "deleteDtlCd", param);
    }

    public List<Map<String, Object>> findListDtlCdMulti(Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findListDtlCdMulti", param);
    }
}
