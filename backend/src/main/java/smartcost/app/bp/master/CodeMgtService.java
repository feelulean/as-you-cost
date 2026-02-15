package smartcost.app.bp.master;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.inject.Inject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CodeMgtService {

    @Inject
    private CodeMgtRepository codeMgtRepository;

    public List<Map<String, Object>> findListGrpCd(Map<String, Object> param) {
        return codeMgtRepository.findListGrpCd(param);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveListGrpCd(Map<String, Object> param) {
        List<Map<String, Object>> saveList = (List<Map<String, Object>>) param.get("saveList");
        Map<String, Object> resultMap = new HashMap<>();
        for (Map<String, Object> row : saveList) {
            String rowStatus = row.containsKey("_rowStatus")
                    ? (String) row.get("_rowStatus")
                    : (String) row.getOrDefault("rowStatus", "");
            if ("C".equals(rowStatus)) {
                codeMgtRepository.insertGrpCd(row);
            } else if ("U".equals(rowStatus)) {
                codeMgtRepository.updateGrpCd(row);
            }
        }
        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }

    public List<Map<String, Object>> findListDtlCd(Map<String, Object> param) {
        return codeMgtRepository.findListDtlCd(param);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveListDtlCd(Map<String, Object> param) {
        List<Map<String, Object>> saveList = (List<Map<String, Object>>) param.get("saveList");
        Map<String, Object> resultMap = new HashMap<>();
        for (Map<String, Object> row : saveList) {
            String rowStatus = row.containsKey("_rowStatus")
                    ? (String) row.get("_rowStatus")
                    : (String) row.getOrDefault("rowStatus", "");
            if ("C".equals(rowStatus)) {
                codeMgtRepository.insertDtlCd(row);
            } else if ("U".equals(rowStatus)) {
                codeMgtRepository.updateDtlCd(row);
            }
        }
        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteListDtlCd(Map<String, Object> param) {
        List<Map<String, Object>> deleteList = (List<Map<String, Object>>) param.get("deleteList");
        Map<String, Object> resultMap = new HashMap<>();
        for (Map<String, Object> row : deleteList) {
            codeMgtRepository.deleteDtlCd(row);
        }
        resultMap.put("resultStatus", "SUCCESS");
        return resultMap;
    }
}
