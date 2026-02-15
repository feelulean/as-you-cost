package smartcost.app.bp.cost.ecbom;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 견적BOM 관리 Controller
 *
 * - 견적원가(EC) 프로젝트의 BOM 데이터를 계층형(Tree) 구조로 관리한다.
 * - 화면 ID: es-ec-bom-list
 * - EC03 프로세스: 견적BOM 작성 및 부품 단가 산정
 */
@RestController
@RequestMapping("/bp/cost/ec/bom")
public class EcBomController {

    @Inject
    private EcBomService ecBomService;

    /**
     * 견적BOM 목록 조회 (계층형)
     *
     * @param param ecPjtCd: 견적 프로젝트 코드
     * @return BOM 목록 (flat list — 프론트에서 트리 변환)
     */
    @RequestMapping("/findListEcBom.do")
    public List<Map<String, Object>> findListEcBom(@RequestBody Map<String, Object> param) {
        return ecBomService.findListEcBom(param);
    }

    /**
     * 견적BOM 전체 저장 (Delete-Insert 방식)
     *
     * @param param ecPjtCd + bomList: BOM 전체 데이터
     * @return 처리 결과
     */
    @RequestMapping("/saveListEcBom.do")
    public Map<String, Object> saveListEcBom(@RequestBody Map<String, Object> param) {
        return ecBomService.saveListEcBom(param);
    }

    /**
     * 견적BOM 선택 삭제
     *
     * @param param ecPjtCd + deleteList: 삭제 대상 목록
     * @return 처리 결과
     */
    @RequestMapping("/deleteListEcBom.do")
    public Map<String, Object> deleteListEcBom(@RequestBody Map<String, Object> param) {
        return ecBomService.deleteListEcBom(param);
    }

    /**
     * 재료비 집계
     *
     * @param param ecPjtCd: 대상 프로젝트
     * @return 집계 결과
     */
    @RequestMapping("/calculateMaterialCost.do")
    public Map<String, Object> calculateMaterialCost(@RequestBody Map<String, Object> param) {
        return ecBomService.calculateMaterialCost(param);
    }

    /**
     * 기존단가 가져오기 (I/F)
     * - 기존 양산단가(C/Over) 연계: 신규부품이 아닌 항목에 단가를 매핑
     * - 현재 Mock I/F 로직으로 구현 (향후 PIMS/ERP 연동 시 Service 교체)
     *
     * @param param ecPjtCd + itemCdList: 단가 연계 대상 품목코드 목록
     * @return 처리 결과 (updatedCount)
     */
    @RequestMapping("/interfaceUnitPrices.do")
    public Map<String, Object> interfaceUnitPrices(@RequestBody Map<String, Object> param) {
        return ecBomService.interfaceUnitPrices(param);
    }
}
