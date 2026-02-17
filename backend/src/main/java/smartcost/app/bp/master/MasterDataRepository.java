package smartcost.app.bp.master;

import java.util.List;
import java.util.Map;
import javax.inject.Inject;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Service;

@Service
public class MasterDataRepository {

    private static final String NAMESPACE = "smartcost.app.bp.master.MasterDataRepository.";

    @Inject
    private SqlSession sqlSession;

    public List<Map<String, Object>> findList(String entity, Map<String, Object> param) {
        return sqlSession.selectList(NAMESPACE + "findList" + capitalize(entity), param);
    }

    public Map<String, Object> findOne(String queryId, Map<String, Object> param) {
        return sqlSession.selectOne(NAMESPACE + queryId, param);
    }

    public void insert(String entity, Map<String, Object> param) {
        sqlSession.insert(NAMESPACE + "insert" + capitalize(entity), param);
    }

    public void update(String entity, Map<String, Object> param) {
        sqlSession.update(NAMESPACE + "update" + capitalize(entity), param);
    }

    public void delete(String entity, Map<String, Object> param) {
        sqlSession.delete(NAMESPACE + "delete" + capitalize(entity), param);
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
