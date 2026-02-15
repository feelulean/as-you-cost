package smartcost.app.bp.master;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.inject.Inject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MasterDataService {

    @Inject
    private MasterDataRepository masterDataRepository;

    public List<Map<String, Object>> findList(String entity, Map<String, Object> param) {
        return masterDataRepository.findList(entity, param);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveList(String entity, Map<String, Object> param) {
        List<Map<String, Object>> saveList = (List<Map<String, Object>>) param.get("saveList");
        Map<String, Object> resultMap = new HashMap<>();
        for (Map<String, Object> row : saveList) {
            String rowStatus = row.containsKey("_rowStatus")
                    ? (String) row.get("_rowStatus")
                    : (String) row.getOrDefault("rowStatus", "");
            if ("C".equals(rowStatus)) {
                masterDataRepository.insert(entity, row);
            } else if ("U".equals(rowStatus)) {
                masterDataRepository.update(entity, row);
            }
        }
        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteList(String entity, Map<String, Object> param) {
        List<Map<String, Object>> deleteList = (List<Map<String, Object>>) param.get("deleteList");
        Map<String, Object> resultMap = new HashMap<>();
        for (Map<String, Object> row : deleteList) {
            masterDataRepository.delete(entity, row);
        }
        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }
}
