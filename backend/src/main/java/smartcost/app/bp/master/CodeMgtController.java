package smartcost.app.bp.master;

import java.util.List;
import java.util.Map;
import javax.inject.Inject;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bp/master/code")
public class CodeMgtController {

    @Inject
    private CodeMgtService codeMgtService;

    @RequestMapping("/findListGrpCd.do")
    public List<Map<String, Object>> findListGrpCd(@RequestBody Map<String, Object> param) {
        return codeMgtService.findListGrpCd(param);
    }

    @RequestMapping("/saveListGrpCd.do")
    public Map<String, Object> saveListGrpCd(@RequestBody Map<String, Object> param) {
        return codeMgtService.saveListGrpCd(param);
    }

    @RequestMapping("/findListDtlCd.do")
    public List<Map<String, Object>> findListDtlCd(@RequestBody Map<String, Object> param) {
        return codeMgtService.findListDtlCd(param);
    }

    @RequestMapping("/saveListDtlCd.do")
    public Map<String, Object> saveListDtlCd(@RequestBody Map<String, Object> param) {
        return codeMgtService.saveListDtlCd(param);
    }

    @RequestMapping("/deleteListDtlCd.do")
    public Map<String, Object> deleteListDtlCd(@RequestBody Map<String, Object> param) {
        return codeMgtService.deleteListDtlCd(param);
    }

    /** 다중 그룹코드 상세코드 일괄 조회 */
    @RequestMapping("/findListDtlCdMulti.do")
    public Map<String, Object> findListDtlCdMulti(@RequestBody Map<String, Object> param) {
        return codeMgtService.findListDtlCdMulti(param);
    }
}
