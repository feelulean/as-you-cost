package smartcost.app.bp.cost.ecdetail;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import smartcost.app.bp.cost.ecbom.EcBomRepository;
import smartcost.app.bp.cost.ecprofit.EcProfitRepository;

/**
 * 견적원가 상세 기능 Service
 * - 견적정보 등록(6탭), 투자비, 제조경비, 판관비, 손익, 민감도, NPV
 */
@Service
public class EcDetailService {

    @Inject
    private EcDetailRepository ecDetailRepository;

    @Inject
    private EcProfitRepository ecProfitRepository;

    @Inject
    private EcBomRepository ecBomRepository;

    /* ═══ 범용 목록 조회 ═══ */
    public List<Map<String, Object>> findList(String entity, Map<String, Object> param) {
        return ecDetailRepository.findList(entity, param);
    }

    /* ═══ 손익계산서 피벗 조회 ═══ */
    public List<Map<String, Object>> findListPlStmtPivot(Map<String, Object> param) {
        // viewType에 따른 viewKey 매핑
        String viewType = str(param.get("viewType"));
        String ecPjtCd  = str(param.get("ecPjtCd"));
        if ("PJT".equals(viewType) || viewType.isEmpty()) {
            param.put("viewType", "PJT");
            param.put("viewKey", ecPjtCd);
        } else if ("GRP".equals(viewType)) {
            param.put("viewKey", str(param.get("costGrpCd")));
        } else if ("CODE".equals(viewType)) {
            param.put("viewKey", str(param.get("costCd")));
        }

        List<Map<String, Object>> result = ecDetailRepository.findListPlStmtPivot(param);

        // basisType='UNIT' → 총액을 연도별 판매수량으로 나눠 단위당 금액 산출
        String basisType = (String) param.get("basisType");
        if ("UNIT".equals(basisType) && result != null && !result.isEmpty()) {
            List<Map<String, Object>> qtyRows = ecDetailRepository.findList("QtyDiscYearSum", param);
            Map<Integer, Double> yearQty = new HashMap<>();
            for (Map<String, Object> qr : qtyRows) {
                yearQty.put(toInt(qr.get("yearVal")), toDouble(qr.get("totalQty")));
            }

            String[] yearKeys = {"y1", "y2", "y3", "y4", "y5"};
            for (Map<String, Object> row : result) {
                String itemCd = str(row.get("itemCd"));
                // 영업이익률(%)은 비율이므로 수량 나누기 하지 않음
                if ("OPER_MARGIN".equals(itemCd)) continue;

                double totalAmt = 0;
                for (int i = 0; i < yearKeys.length; i++) {
                    double val = toDouble(row.get(yearKeys[i]));
                    double qty = yearQty.getOrDefault(i + 1, 0.0);
                    double unitVal = qty > 0 ? Math.round(val / qty) : 0;
                    row.put(yearKeys[i], unitVal);
                    totalAmt += unitVal;
                }
                row.put("totalAmt", totalAmt);
            }
        }

        // TOTAL 영업이익률 보정: 연도별 %의 단순합산이 아닌
        // (TOTAL 영업이익 / TOTAL 매출액) * 100 으로 재계산
        if (result != null && !result.isEmpty()) {
            double totalRevenue = 0;
            double totalOperIncome = 0;
            Map<String, Object> operMarginRow = null;

            for (Map<String, Object> row : result) {
                String itemCd = str(row.get("itemCd"));
                if ("REVENUE".equals(itemCd)) {
                    totalRevenue = toDouble(row.get("totalAmt"));
                } else if ("OPER_INCOME".equals(itemCd)) {
                    totalOperIncome = toDouble(row.get("totalAmt"));
                } else if ("OPER_MARGIN".equals(itemCd)) {
                    operMarginRow = row;
                }
            }

            if (operMarginRow != null) {
                double correctMargin = totalRevenue > 0
                        ? Math.round(totalOperIncome / totalRevenue * 10000.0) / 100.0
                        : 0;
                operMarginRow.put("totalAmt", correctMargin);
            }
        }

        return result;
    }

    /* ═══ 견적정보 상세 단건 조회 ═══ */
    public Map<String, Object> findEcDetail(Map<String, Object> param) {
        Map<String, Object> result = ecDetailRepository.findOne("EcDetail", param);
        if (result == null) result = new HashMap<>();
        return result;
    }

    /* ═══ 견적정보 상세 저장 (Insert or Update) ═══ */
    @Transactional
    public Map<String, Object> saveEcDetail(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        int cnt = ecDetailRepository.count("EcDetail", param);
        if (cnt > 0) {
            ecDetailRepository.update("EcDetail", param);
        } else {
            ecDetailRepository.insert("EcDetail", param);
        }
        // baseCurrency가 포함되어 있으면 프로젝트 마스터도 갱신
        if (param.containsKey("baseCurrency")) {
            ecDetailRepository.update("PjtBaseCurrency", param);
        }

        result.put("status", "OK");
        return result;
    }

    /* ═══ 수량/할인율 저장 (열→행 언피벗) ═══ */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveQtyDisc(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();

        // 1) 기존 데이터 전체 삭제
        ecDetailRepository.delete("QtyDiscByPjt", param);

        // 2) 프론트엔드 행(yr1Qty~yr5Qty, yr1DiscRate~yr5DiscRate) → 개별 row 변환
        List<Map<String, Object>> saveList = (List<Map<String, Object>>) param.get("saveList");
        int insertCnt = 0;
        if (saveList != null) {
            String ecPjtCd = (String) param.get("ecPjtCd");
            for (Map<String, Object> row : saveList) {
                String costCd = (String) row.get("costCd");
                for (int yr = 1; yr <= 5; yr++) {
                    Object qty  = row.get("yr" + yr + "Qty");
                    Object disc = row.get("yr" + yr + "DiscRate");
                    if (qty == null && disc == null) continue; // 값 없으면 skip

                    Map<String, Object> dbRow = new HashMap<>();
                    dbRow.put("ecPjtCd", ecPjtCd);
                    dbRow.put("costCd", costCd);
                    dbRow.put("yearVal", String.valueOf(yr));
                    dbRow.put("salesQty", qty);
                    dbRow.put("discRate", disc);
                    ecDetailRepository.insert("QtyDisc", dbRow);
                    insertCnt++;
                }
            }
        }
        result.put("status", "OK");
        result.put("count", insertCnt);
        return result;
    }

    /* ═══ 범용 목록 저장 (Insert/Update by _rowStatus) ═══ */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveList(String entity, Map<String, Object> param) {
        List<Map<String, Object>> saveList = (List<Map<String, Object>>) param.get("saveList");
        String ecPjtCd = (String) param.get("ecPjtCd");
        Map<String, Object> result = new HashMap<>();

        if (saveList != null) {
            for (Map<String, Object> row : saveList) {
                /* 기존 행은 ecPjtCd가 없을 수 있으므로 상위 파라미터에서 주입 */
                if (ecPjtCd != null && !row.containsKey("ecPjtCd")) {
                    row.put("ecPjtCd", ecPjtCd);
                }

                String rowStatus = row.containsKey("_rowStatus")
                        ? (String) row.get("_rowStatus") : "U";

                if ("C".equals(rowStatus)) {
                    ecDetailRepository.insert(entity, row);
                } else {
                    ecDetailRepository.update(entity, row);
                }
            }
        }
        result.put("status", "OK");
        result.put("count", saveList != null ? saveList.size() : 0);
        return result;
    }

    /* ═══ 범용 목록 삭제 ═══ */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteList(String entity, Map<String, Object> param) {
        List<Map<String, Object>> deleteList = (List<Map<String, Object>>) param.get("deleteList");
        String ecPjtCd = (String) param.get("ecPjtCd");
        Map<String, Object> result = new HashMap<>();

        if (deleteList != null) {
            for (Map<String, Object> row : deleteList) {
                if (ecPjtCd != null && !row.containsKey("ecPjtCd")) {
                    row.put("ecPjtCd", ecPjtCd);
                }
                ecDetailRepository.delete(entity, row);
            }
        }
        result.put("status", "OK");
        result.put("count", deleteList != null ? deleteList.size() : 0);
        return result;
    }

    /* ═══════════════════════════════════════════════════════════════
       제조경비 계산
       인원계획 + 라인투자비 + 기타투자비 + 수량/할인율 데이터로부터
       12개 원가항목을 계산하고 결과를 DB에 저장 후 구조화된 응답을 반환
       ═══════════════════════════════════════════════════════════════ */
    @Transactional
    public Map<String, Object> calculateMfgCost(Map<String, Object> param) {
        // 선행조건: 원가코드 + 수량/할인율 등록 여부
        int costCodeCnt = ecDetailRepository.count("CostCode", param);
        int qtyDiscCnt  = ecDetailRepository.count("QtyDisc", param);
        if (costCodeCnt == 0 || qtyDiscCnt == 0) {
            Map<String, Object> fail = new HashMap<>();
            fail.put("status", "FAIL");
            fail.put("message", "원가코드 및 수량/할인율을 먼저 등록해 주세요.");
            return fail;
        }

        String ecPjtCd = (String) param.get("ecPjtCd");
        double wageIncRate      = toDouble(param.get("wageIncRate"));
        double inflationRate    = toDouble(param.get("inflationRate"));
        double prodDirectRate   = toDouble(param.get("prodDirectRate"));
        double laborRelatedRate = toDouble(param.get("laborRelatedRate"));
        double etcMfgRate       = toDouble(param.get("etcMfgRate"));
        double moldCostUnit     = toDouble(param.get("moldCostUnit"));
        double outsrcCostUnit   = toDouble(param.get("outsrcCostUnit"));

        // 계산 수행
        Map<String, Object> computed = computeMfgCostDetails(ecPjtCd,
                wageIncRate, inflationRate, prodDirectRate,
                laborRelatedRate, etcMfgRate, moldCostUnit, outsrcCostUnit);

        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) computed.get("resultSummary");

        // DB 저장: 기존 데이터 삭제 후 코스트코드별 INSERT
        Map<String, Object> delParam = new HashMap<>();
        delParam.put("ecPjtCd", ecPjtCd);
        ecDetailRepository.deleteByPjt("MfgCost", delParam);

        List<Map<String, Object>> costCodeList = ecDetailRepository.findList("CostCode",
                new HashMap<>(delParam));

        // 저장할 공통 데이터 구성
        Map<String, Object> saveBase = new HashMap<>();
        saveBase.put("ecPjtCd", ecPjtCd);
        saveBase.put("wageIncRate", wageIncRate);
        saveBase.put("inflationRate", inflationRate);
        saveBase.put("prodDirectRate", prodDirectRate);
        saveBase.put("laborRelatedRate", laborRelatedRate);
        saveBase.put("etcMfgRate", etcMfgRate);
        saveBase.put("moldCost", moldCostUnit);
        saveBase.put("outsrcCost", outsrcCostUnit);
        saveBase.put("outsrcRate", 0);
        saveBase.put("directLabor", summary.get("directLaborCost"));
        saveBase.put("indirectLabor", summary.get("indirectLaborCost"));
        saveBase.put("prodDirectExp", summary.get("prodDirectCost"));
        saveBase.put("laborRelatedExp", summary.get("laborRelatedCost"));
        saveBase.put("otherMfgExp", summary.get("etcMfgCost"));
        saveBase.put("deprBuilding", summary.get("deprBldgCost"));
        saveBase.put("deprLine", summary.get("deprLineCost"));
        saveBase.put("deprOther", summary.get("deprEtcCost"));
        saveBase.put("rndCost", 0);
        saveBase.put("otherExp", 0);
        saveBase.put("totalMfgCost", summary.get("totalMfgCost"));

        if (costCodeList != null && !costCodeList.isEmpty()) {
            for (Map<String, Object> cc : costCodeList) {
                Map<String, Object> saveParam = new HashMap<>(saveBase);
                saveParam.put("costCd", cc.get("costCd"));
                ecDetailRepository.insert("MfgCost", saveParam);
            }
        } else {
            Map<String, Object> saveParam = new HashMap<>(saveBase);
            saveParam.put("costCd", "ALL");
            ecDetailRepository.insert("MfgCost", saveParam);
        }

        computed.put("status", "OK");
        computed.put("message", "제조경비 계산 완료");
        return computed;
    }

    /* ═══ 제조경비 구조화 조회 (프로젝트 클릭 시) ═══ */
    public Map<String, Object> findMfgCostStructured(Map<String, Object> param) {
        // 1) 저장된 MfgCost 데이터 조회
        List<Map<String, Object>> mfgCostList = ecDetailRepository.findList("MfgCost", param);

        if (mfgCostList == null || mfgCostList.isEmpty()) {
            return new HashMap<>(); // 비어있으면 프론트에서 빈 폼 초기화
        }

        // 2) 첫 번째 행에서 입력 파라미터 및 결과 추출
        Map<String, Object> saved = mfgCostList.get(0);

        Map<String, Object> inputData = new HashMap<>();
        inputData.put("ecPjtCd", saved.get("ecPjtCd"));
        inputData.put("wageIncRate", saved.get("wageIncRate"));
        inputData.put("inflationRate", saved.get("inflationRate"));
        inputData.put("prodDirectRate", saved.get("prodDirectRate"));
        inputData.put("laborRelatedRate", saved.get("laborRelatedRate"));
        inputData.put("etcMfgRate", saved.get("etcMfgRate"));
        inputData.put("moldCostUnit", saved.get("moldCost"));
        inputData.put("outsrcCostUnit", saved.get("outsrcCost"));

        // 3) 소스 데이터로부터 상세 탭 재계산
        String ecPjtCd = (String) saved.get("ecPjtCd");
        Map<String, Object> computed = computeMfgCostDetails(ecPjtCd,
                toDouble(saved.get("wageIncRate")),
                toDouble(saved.get("inflationRate")),
                toDouble(saved.get("prodDirectRate")),
                toDouble(saved.get("laborRelatedRate")),
                toDouble(saved.get("etcMfgRate")),
                toDouble(saved.get("moldCost")),
                toDouble(saved.get("outsrcCost")));

        computed.put("inputData", inputData);
        return computed;
    }

    /* ═══════════════════════════════════════════════════════════════
       제조경비 상세 계산 공통 로직
       인원계획·투자비·수량 데이터를 조합하여 12개 원가항목을 산출한다.
       ═══════════════════════════════════════════════════════════════ */
    private Map<String, Object> computeMfgCostDetails(String ecPjtCd,
            double wageIncRate, double inflationRate, double prodDirectRate,
            double laborRelatedRate, double etcMfgRate, double moldCostUnit, double outsrcCostUnit) {

        Map<String, Object> result = new HashMap<>();
        Map<String, Object> pjtParam = new HashMap<>();
        pjtParam.put("ecPjtCd", ecPjtCd);

        // ── 1) 연도별 총 판매수량 ──
        List<Map<String, Object>> qtyRows = ecDetailRepository.findList("QtyDiscYearSum",
                new HashMap<>(pjtParam));
        Map<Integer, Double> yearQty = new HashMap<>();
        for (Map<String, Object> row : qtyRows) {
            yearQty.put(toInt(row.get("yearVal")), toDouble(row.get("totalQty")));
        }

        // ── 2) 인원계획 ──
        List<Map<String, Object>> manpowerList = ecDetailRepository.findList("Manpower",
                new HashMap<>(pjtParam));

        // ── 3) 라인투자비 ──
        List<Map<String, Object>> lineInvestList = ecDetailRepository.findList("LineInvest",
                new HashMap<>(pjtParam));

        // ── 4) 기타투자비 ──
        List<Map<String, Object>> otherInvestList = ecDetailRepository.findList("OtherInvest",
                new HashMap<>(pjtParam));

        /* ═══ 직접노무비 / 간접노무비 ═══ */
        List<Map<String, Object>> detailDirectLabor = new ArrayList<>();
        List<Map<String, Object>> detailIndirectLabor = new ArrayList<>();
        double sumDirectY1 = 0, sumIndirectY1 = 0;

        for (Map<String, Object> mp : manpowerList) {
            String mpType = str(mp.get("mpType"));
            double avgWage = toDouble(mp.get("avgWage"));
            double y1Cnt = toDouble(mp.get("y1Cnt"));
            double y2Cnt = toDouble(mp.get("y2Cnt"));
            double y3Cnt = toDouble(mp.get("y3Cnt"));

            Map<String, Object> detail = new HashMap<>();
            detail.put("lineNm", mp.get("mpNm"));
            detail.put("lineType", mpType);
            detail.put("workerCnt", y1Cnt);
            detail.put("wagePerPerson", Math.round(avgWage));
            detail.put("annualCost", Math.round(avgWage * y1Cnt));

            // 단위원가 = 연간인건비(임금×인원×임금인상률^(yr-1)) / 연간판매수량
            double ucY1 = Math.round(divSafe(
                    avgWage * y1Cnt * Math.pow(1 + wageIncRate / 100, 0),
                    yearQty.getOrDefault(1, 0.0)));
            double ucY2 = Math.round(divSafe(
                    avgWage * y2Cnt * Math.pow(1 + wageIncRate / 100, 1),
                    yearQty.getOrDefault(2, 0.0)));
            double ucY3 = Math.round(divSafe(
                    avgWage * y3Cnt * Math.pow(1 + wageIncRate / 100, 2),
                    yearQty.getOrDefault(3, 0.0)));

            detail.put("unitCostY1", ucY1);
            detail.put("unitCostY2", ucY2);
            detail.put("unitCostY3", ucY3);

            boolean isDirect = "DIRECT".equalsIgnoreCase(mpType);
            if (isDirect) {
                detailDirectLabor.add(detail);
                sumDirectY1 += ucY1;
            } else {
                detailIndirectLabor.add(detail);
                sumIndirectY1 += ucY1;
            }
        }

        /* ═══ 비율 기반 원가 (생산직접경비 / 인건비성경비 / 기타제조경비) ═══ */
        double prodDirectCost   = Math.round(sumDirectY1 * prodDirectRate / 100);
        double laborRelatedCost = Math.round((sumDirectY1 + sumIndirectY1) * laborRelatedRate / 100);
        double etcMfgCost       = Math.round((sumDirectY1 + sumIndirectY1) * etcMfgRate / 100);

        List<Map<String, Object>> detailProdDirect = new ArrayList<>();
        {
            Map<String, Object> d = new HashMap<>();
            d.put("costItemNm", "생산직접경비");
            d.put("lineType", "비율");
            d.put("baseAmt", sumDirectY1);
            d.put("rateApplied", prodDirectRate);
            d.put("unitCostY1", prodDirectCost);
            d.put("unitCostY2", Math.round(prodDirectCost * Math.pow(1 + inflationRate / 100, 1)));
            d.put("unitCostY3", Math.round(prodDirectCost * Math.pow(1 + inflationRate / 100, 2)));
            detailProdDirect.add(d);
        }

        double totalLabor = sumDirectY1 + sumIndirectY1;
        List<Map<String, Object>> detailLaborRelated = new ArrayList<>();
        {
            Map<String, Object> d = new HashMap<>();
            d.put("costItemNm", "인건비성경비");
            d.put("lineType", "비율");
            d.put("baseAmt", totalLabor);
            d.put("rateApplied", laborRelatedRate);
            d.put("unitCostY1", laborRelatedCost);
            d.put("unitCostY2", Math.round(laborRelatedCost * Math.pow(1 + inflationRate / 100, 1)));
            d.put("unitCostY3", Math.round(laborRelatedCost * Math.pow(1 + inflationRate / 100, 2)));
            detailLaborRelated.add(d);
        }

        List<Map<String, Object>> detailEtcMfg = new ArrayList<>();
        {
            Map<String, Object> d = new HashMap<>();
            d.put("costItemNm", "기타제조경비");
            d.put("lineType", "비율");
            d.put("baseAmt", totalLabor);
            d.put("rateApplied", etcMfgRate);
            d.put("unitCostY1", etcMfgCost);
            d.put("unitCostY2", Math.round(etcMfgCost * Math.pow(1 + inflationRate / 100, 1)));
            d.put("unitCostY3", Math.round(etcMfgCost * Math.pow(1 + inflationRate / 100, 2)));
            detailEtcMfg.add(d);
        }

        /* ═══ 감가상각비 — 기타투자비 → 건구축물 / 기타 분류 ═══ */
        List<Map<String, Object>> detailDeprBldg = new ArrayList<>();
        List<Map<String, Object>> detailDeprEtc  = new ArrayList<>();
        double sumDeprBldgY1 = 0, sumDeprEtcY1 = 0;

        for (Map<String, Object> inv : otherInvestList) {
            String investType = str(inv.get("investType"));
            double acqAmt = toDouble(inv.get("acqAmt"));
            int usefulLife = toInt(inv.get("usefulLife"));
            if (usefulLife <= 0) usefulLife = 1;
            double annualDepr = Math.round(acqAmt / usefulLife);

            Map<String, Object> detail = new HashMap<>();
            detail.put("assetNm", inv.get("investNm"));
            detail.put("lineType", investType);
            detail.put("acqAmt", Math.round(acqAmt));
            detail.put("usefulLife", usefulLife);
            detail.put("annualDepr", annualDepr);

            double ucY1 = Math.round(divSafe(annualDepr, yearQty.getOrDefault(1, 0.0)));
            double ucY2 = Math.round(divSafe(annualDepr, yearQty.getOrDefault(2, 0.0)));
            double ucY3 = Math.round(divSafe(annualDepr, yearQty.getOrDefault(3, 0.0)));
            detail.put("unitCostY1", ucY1);
            detail.put("unitCostY2", ucY2);
            detail.put("unitCostY3", ucY3);

            boolean isBldg = "BUILDING".equalsIgnoreCase(investType)
                    || "LAND".equalsIgnoreCase(investType);
            if (isBldg) {
                detailDeprBldg.add(detail);
                sumDeprBldgY1 += ucY1;
            } else {
                detailDeprEtc.add(detail);
                sumDeprEtcY1 += ucY1;
            }
        }

        /* ═══ 감가상각비 — 라인투자비 → 생산라인 ═══ */
        List<Map<String, Object>> detailDeprLine = new ArrayList<>();
        double sumDeprLineY1 = 0;

        for (Map<String, Object> inv : lineInvestList) {
            double acqAmt = toDouble(inv.get("acqAmt"));
            int usefulLife = toInt(inv.get("usefulLife"));
            if (usefulLife <= 0) usefulLife = 1;
            double annualDepr = Math.round(acqAmt / usefulLife);

            Map<String, Object> detail = new HashMap<>();
            detail.put("assetNm", inv.get("lineNm"));
            detail.put("lineType", str(inv.get("lineType")));
            detail.put("acqAmt", Math.round(acqAmt));
            detail.put("usefulLife", usefulLife);
            detail.put("annualDepr", annualDepr);

            double ucY1 = Math.round(divSafe(annualDepr, yearQty.getOrDefault(1, 0.0)));
            double ucY2 = Math.round(divSafe(annualDepr, yearQty.getOrDefault(2, 0.0)));
            double ucY3 = Math.round(divSafe(annualDepr, yearQty.getOrDefault(3, 0.0)));
            detail.put("unitCostY1", ucY1);
            detail.put("unitCostY2", ucY2);
            detail.put("unitCostY3", ucY3);

            detailDeprLine.add(detail);
            sumDeprLineY1 += ucY1;
        }

        /* ═══ 외주가공비 ═══ */
        List<Map<String, Object>> detailOutsrc = new ArrayList<>();
        if (outsrcCostUnit > 0) {
            Map<String, Object> row = new HashMap<>();
            row.put("processNm", "외주가공");
            row.put("lineType", "단가");
            row.put("outsrcVendor", "-");
            row.put("unitPrice", outsrcCostUnit);
            row.put("unitCostY1", outsrcCostUnit);
            row.put("unitCostY2", Math.round(outsrcCostUnit * Math.pow(1 + inflationRate / 100, 1)));
            row.put("unitCostY3", Math.round(outsrcCostUnit * Math.pow(1 + inflationRate / 100, 2)));
            detailOutsrc.add(row);
        }

        /* ═══ 금형비 ═══ */
        List<Map<String, Object>> detailMold = new ArrayList<>();
        if (moldCostUnit > 0) {
            double totalProdQty = 0;
            for (int yr = 1; yr <= 5; yr++) totalProdQty += yearQty.getOrDefault(yr, 0.0);
            Map<String, Object> row = new HashMap<>();
            row.put("moldNm", "금형비");
            row.put("lineType", "단가");
            row.put("moldAcqAmt", Math.round(moldCostUnit * totalProdQty));
            row.put("totalProdQty", totalProdQty);
            row.put("unitCostY1", moldCostUnit);
            row.put("unitCostY2", moldCostUnit);
            row.put("unitCostY3", moldCostUnit);
            detailMold.add(row);
        }

        /* ═══ 결과 요약 ═══ */
        double totalMfgCost = sumDirectY1 + sumIndirectY1
                + prodDirectCost + laborRelatedCost + etcMfgCost
                + sumDeprBldgY1 + sumDeprLineY1 + sumDeprEtcY1
                + outsrcCostUnit + moldCostUnit;

        Map<String, Object> resultSummary = new HashMap<>();
        resultSummary.put("directLaborCost",   sumDirectY1);
        resultSummary.put("indirectLaborCost", sumIndirectY1);
        resultSummary.put("prodDirectCost",    prodDirectCost);
        resultSummary.put("laborRelatedCost",  laborRelatedCost);
        resultSummary.put("etcMfgCost",        etcMfgCost);
        resultSummary.put("deprBldgCost",      sumDeprBldgY1);
        resultSummary.put("deprLineCost",       sumDeprLineY1);
        resultSummary.put("deprEtcCost",        sumDeprEtcY1);
        resultSummary.put("outsrcCost",        outsrcCostUnit);
        resultSummary.put("moldCost",          moldCostUnit);
        resultSummary.put("rndCost",           0.0);
        resultSummary.put("etcCost",           0.0);
        resultSummary.put("totalMfgCost",      totalMfgCost);

        result.put("resultSummary",      resultSummary);
        result.put("detailDirectLabor",  detailDirectLabor);
        result.put("detailIndirectLabor", detailIndirectLabor);
        result.put("detailProdDirect",   detailProdDirect);
        result.put("detailLaborRelated", detailLaborRelated);
        result.put("detailEtcMfg",       detailEtcMfg);
        result.put("detailDeprBldg",     detailDeprBldg);
        result.put("detailDeprLine",     detailDeprLine);
        result.put("detailDeprEtc",      detailDeprEtc);
        result.put("detailOutsrc",       detailOutsrc);
        result.put("detailMold",         detailMold);

        return result;
    }

    /* ═══ 판매관리비 조회 (프론트엔드 포맷) ═══ */
    public Map<String, Object> findSgaCostData(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> sgaList = ecDetailRepository.findList("SgaCost", param);

        if (sgaList != null && !sgaList.isEmpty()) {
            // 모든 원가코드에 동일한 비율 적용 — 첫 행의 비율 사용
            result.put("sgaData", sgaList.get(0));
            result.put("sgaResultList", buildSgaResultList(sgaList));
        }
        return result;
    }

    /* ═══ 판매관리비 계산 ═══ */
    @Transactional
    public Map<String, Object> calculateSgaCost(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();

        // 선행조건: 제조경비 계산 완료 여부
        int mfgCostCnt = ecDetailRepository.count("MfgCost", param);
        if (mfgCostCnt == 0) {
            result.put("status", "FAIL");
            result.put("message", "제조경비를 먼저 계산해 주세요.");
            return result;
        }

        // 1) 비율 합산
        double salesLaborRate  = toDouble(param.get("salesLaborRate"));
        double transportRate   = toDouble(param.get("transportRate"));
        double exportRate      = toDouble(param.get("exportRate"));
        double warrantyRate    = toDouble(param.get("warrantyRate"));
        double advertisingRate = toDouble(param.get("advertisingRate"));
        double researchRate    = toDouble(param.get("researchRate"));
        double assetCostRate   = toDouble(param.get("assetCostRate"));
        double hrCostRate      = toDouble(param.get("hrCostRate"));
        double etcRate         = toDouble(param.get("etcRate"));
        double totalRate = salesLaborRate + transportRate + exportRate + warrantyRate
                         + advertisingRate + researchRate + assetCostRate + hrCostRate + etcRate;

        // 2) 원가코드별 제조원가 조회
        List<Map<String, Object>> costCodes = ecDetailRepository.findList("CostCode", param);
        List<Map<String, Object>> mfgCosts  = ecDetailRepository.findList("MfgCost", param);

        // costCd → totalMfgCost 매핑
        Map<String, Double> mfgCostMap = new HashMap<>();
        for (Map<String, Object> mc : mfgCosts) {
            mfgCostMap.put(str(mc.get("costCd")), toDouble(mc.get("totalMfgCost")));
        }

        // 3) 원가코드별 SGA 레코드 upsert
        for (Map<String, Object> cc : costCodes) {
            String costCd = str(cc.get("costCd"));
            double mfgTotal = mfgCostMap.getOrDefault(costCd, 0.0);
            double sgaCost = Math.round(mfgTotal * totalRate / 100.0);

            Map<String, Object> sgaParam = new HashMap<>(param);
            sgaParam.put("costCd", costCd);
            sgaParam.put("totalSgaCost", sgaCost);

            int cnt = ecDetailRepository.count("SgaCost", sgaParam);
            if (cnt > 0) {
                ecDetailRepository.update("SgaCost", sgaParam);
            } else {
                ecDetailRepository.insert("SgaCost", sgaParam);
            }
        }

        // 4) 결과 목록 생성
        List<Map<String, Object>> sgaList = ecDetailRepository.findList("SgaCost", param);
        result.put("status", "OK");
        result.put("message", "판매관리비 계산 완료");
        result.put("sgaResultList", buildSgaResultList(sgaList));
        return result;
    }

    private List<Map<String, Object>> buildSgaResultList(List<Map<String, Object>> sgaList) {
        List<Map<String, Object>> resultList = new ArrayList<>();

        // 전체 원가코드의 totalSgaCost 합산
        double totalSgaCostSum = 0;
        for (Map<String, Object> row : sgaList) {
            totalSgaCostSum += toDouble(row.get("totalSgaCost"));
        }

        // 비율 항목 (첫 행 기준 — 모든 코드 동일)
        Map<String, Object> rates = sgaList.get(0);
        String[][] items = {
            {"salesLaborRate",  "판매인건비"},
            {"transportRate",   "운반비"},
            {"exportRate",      "수출비"},
            {"warrantyRate",    "품질보증비"},
            {"advertisingRate", "광고선전비"},
            {"researchRate",    "연구비"},
            {"assetCostRate",   "자산비용"},
            {"hrCostRate",      "인적비용"},
            {"etcRate",         "기타관련비"}
        };

        double totalRate = 0;
        for (String[] item : items) {
            totalRate += toDouble(rates.get(item[0]));
        }

        for (String[] item : items) {
            double rate = toDouble(rates.get(item[0]));
            double amt = totalRate > 0 ? Math.round(totalSgaCostSum * rate / totalRate) : 0;
            Map<String, Object> row = new HashMap<>();
            row.put("itemNm", item[1]);
            row.put("rate", rate);
            row.put("amt", amt);
            resultList.add(row);
        }

        // 합계 행
        Map<String, Object> totalRow = new HashMap<>();
        totalRow.put("itemNm", "합계");
        totalRow.put("rate", totalRate);
        totalRow.put("amt", totalSgaCostSum);
        resultList.add(totalRow);

        return resultList;
    }

    /* ═══ 손익계산서 산출 ═══ */
    @Transactional
    public Map<String, Object> calculatePlStmt(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();

        // 선행조건: 제조경비 + 판매관리비 계산 완료 여부
        int mfgCostCnt = ecDetailRepository.count("MfgCost", param);
        if (mfgCostCnt == 0) {
            result.put("status", "FAIL");
            result.put("message", "제조경비를 먼저 계산해 주세요.");
            return result;
        }
        int sgaCostCnt = ecDetailRepository.count("SgaCost", param);
        if (sgaCostCnt == 0) {
            result.put("status", "FAIL");
            result.put("message", "판매관리비를 먼저 계산해 주세요.");
            return result;
        }

        // 1) 기존 손익계산서 데이터 삭제 (VIEW_TYPE 무관하게 전체 삭제)
        ecDetailRepository.deleteByPjt("PlStmt", param);

        // 2) PJT 레벨 산출 (기존)
        ecDetailRepository.insertCalcPlStmt(param);

        // 3) GRP 레벨 산출 (원가그룹별)
        ecDetailRepository.insertCalcPlStmtGrp(param);

        // 4) CODE 레벨 산출 (원가코드별)
        ecDetailRepository.insertCalcPlStmtCode(param);

        // 5) 피벗 조회 + basisType 변환 적용
        List<Map<String, Object>> plList = findListPlStmtPivot(param);
        result.put("status", "OK");
        result.put("message", "손익계산서 산출 완료");
        result.put("plList", plList);
        return result;
    }

    /* ═══════════════════════════════════════════════════════════════
       NPV 수익성 분석
       PL손익계산서 + 투자비 + WACC 데이터로부터 7개년 Cash Flow를
       계산하고 NPV, IRR, PI, Payback Period 지표를 산출한다.
       ═══════════════════════════════════════════════════════════════ */

    /* ═══ NPV 계산 (계산 + DB 저장 + 반환) ═══ */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> calculateNpv(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        String ecPjtCd = (String) param.get("ecPjtCd");
        Map<String, Object> pjtParam = new HashMap<>();
        pjtParam.put("ecPjtCd", ecPjtCd);

        // 1) WACC Rate, Tax Rate 조회
        Map<String, Object> profitData = ecProfitRepository.findEcProfit(param);
        if (profitData == null) {
            result.put("status", "FAIL");
            result.put("message", "수익성 분석 기준정보(WACC)를 먼저 등록해 주세요.");
            return result;
        }
        double waccRate = toDouble(profitData.get("waccRate"));
        double taxRate  = toDouble(profitData.get("taxRate"));

        // 2) 손익계산서 연도별 영업이익 조회
        Map<String, Object> plParam = new HashMap<>(pjtParam);
        plParam.put("viewType", "PJT");
        List<Map<String, Object>> plList = ecDetailRepository.findList("PlStmt", plParam);
        Map<Integer, Double> yearOperIncome = new HashMap<>();
        for (Map<String, Object> pl : plList) {
            yearOperIncome.put(toInt(pl.get("yearVal")), toDouble(pl.get("operIncome")));
        }

        // 3) 투자비 조회
        List<Map<String, Object>> lineInvest  = ecDetailRepository.findList("LineInvest", new HashMap<>(pjtParam));
        List<Map<String, Object>> otherInvest = ecDetailRepository.findList("OtherInvest", new HashMap<>(pjtParam));

        // 4) Cash Flow 계산
        Map<String, Object> cfResult = computeCashFlows(waccRate, taxRate, yearOperIncome, lineInvest, otherInvest);
        List<Map<String, Object>> cashFlowList = (List<Map<String, Object>>) cfResult.get("cashFlowList");
        double[] fcfArray    = (double[]) cfResult.get("fcfArray");
        double totalPv       = toDouble(cfResult.get("totalPv"));
        double pvInflows     = toDouble(cfResult.get("pvInflows"));
        double pvInvestments = toDouble(cfResult.get("pvInvestments"));

        // 5) 지표 산출
        double npvValue      = Math.round(totalPv);
        double irr           = calcIrr(fcfArray);
        double paybackPeriod = calcPaybackPeriod(fcfArray);
        double piValue       = pvInvestments > 0
                ? Math.round(pvInflows / pvInvestments * 100.0) / 100.0 : 0;

        Map<String, Object> npvData = new HashMap<>();
        npvData.put("waccRate",      waccRate);
        npvData.put("npvValue",      npvValue);
        npvData.put("irrValue",      Math.round(irr * 100.0) / 100.0);
        npvData.put("paybackPeriod", Math.round(paybackPeriod * 100.0) / 100.0);
        npvData.put("piValue",       piValue);

        // 6) DB 저장
        Map<String, Object> saveParam = new HashMap<>(param);
        saveParam.put("analysisVer",   1);
        saveParam.put("analysisType",  "NPV");
        saveParam.put("waccRate",      waccRate);
        saveParam.put("npvValue",      npvValue);
        saveParam.put("irrValue",      Math.round(irr * 100.0) / 100.0);
        saveParam.put("paybackPeriod", Math.round(paybackPeriod * 100.0) / 100.0);
        saveParam.put("piValue",       piValue);

        int cnt = ecDetailRepository.count("Npv", param);
        if (cnt > 0) {
            ecDetailRepository.update("Npv", saveParam);
        } else {
            ecDetailRepository.insert("Npv", saveParam);
        }

        // 7) 반환
        result.put("status", "OK");
        result.put("message", "NPV 수익성 분석 완료");
        result.put("npvData", npvData);
        result.put("cashFlowList", cashFlowList);
        return result;
    }

    /* ═══ NPV 데이터 조회 (저장된 요약 + Cash Flow 재계산) ═══ */
    @SuppressWarnings("unchecked")
    public Map<String, Object> findNpvData(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        String ecPjtCd = (String) param.get("ecPjtCd");
        Map<String, Object> pjtParam = new HashMap<>();
        pjtParam.put("ecPjtCd", ecPjtCd);

        // 저장된 NPV 요약 조회
        List<Map<String, Object>> npvList = ecDetailRepository.findList("Npv", param);
        Map<String, Object> savedNpv = (npvList != null && !npvList.isEmpty()) ? npvList.get(0) : null;

        // WACC / Tax Rate 조회
        Map<String, Object> profitData = ecProfitRepository.findEcProfit(param);
        if (profitData == null) {
            // 기준정보 없으면 저장된 NPV만 반환
            if (savedNpv != null) {
                result.put("npvData", buildNpvDataFromSaved(savedNpv));
            }
            return result;
        }

        double waccRate = toDouble(profitData.get("waccRate"));
        double taxRate  = toDouble(profitData.get("taxRate"));

        // PL Statement 조회
        Map<String, Object> plParam = new HashMap<>(pjtParam);
        plParam.put("viewType", "PJT");
        List<Map<String, Object>> plList = ecDetailRepository.findList("PlStmt", plParam);
        Map<Integer, Double> yearOperIncome = new HashMap<>();
        for (Map<String, Object> pl : plList) {
            yearOperIncome.put(toInt(pl.get("yearVal")), toDouble(pl.get("operIncome")));
        }

        // 투자비 조회
        List<Map<String, Object>> lineInvest  = ecDetailRepository.findList("LineInvest", new HashMap<>(pjtParam));
        List<Map<String, Object>> otherInvest = ecDetailRepository.findList("OtherInvest", new HashMap<>(pjtParam));

        // Cash Flow 재계산
        Map<String, Object> cfResult = computeCashFlows(waccRate, taxRate, yearOperIncome, lineInvest, otherInvest);
        result.put("cashFlowList", cfResult.get("cashFlowList"));

        // NPV 요약 데이터
        if (savedNpv != null) {
            result.put("npvData", buildNpvDataFromSaved(savedNpv));
        } else {
            Map<String, Object> npvData = new HashMap<>();
            npvData.put("waccRate",      waccRate);
            npvData.put("npvValue",      0);
            npvData.put("irrValue",      0);
            npvData.put("paybackPeriod", 0);
            npvData.put("piValue",       0);
            result.put("npvData", npvData);
        }

        return result;
    }

    private Map<String, Object> buildNpvDataFromSaved(Map<String, Object> saved) {
        Map<String, Object> npvData = new HashMap<>();
        npvData.put("waccRate",      toDouble(saved.get("waccRate")));
        npvData.put("npvValue",      toDouble(saved.get("npvValue")));
        npvData.put("irrValue",      toDouble(saved.get("irrValue")));
        npvData.put("paybackPeriod", toDouble(saved.get("paybackPeriod")));
        npvData.put("piValue",       toDouble(saved.get("piValue")));
        return npvData;
    }

    /* ═══ NPV 데이터 저장 ═══ */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveNpvData(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> npvData = (Map<String, Object>) param.get("npvData");
        if (npvData == null) {
            result.put("status", "FAIL");
            result.put("message", "저장할 NPV 데이터가 없습니다.");
            return result;
        }

        Map<String, Object> saveParam = new HashMap<>(param);
        saveParam.put("analysisVer",   1);
        saveParam.put("analysisType",  "NPV");
        saveParam.put("waccRate",      npvData.get("waccRate"));
        saveParam.put("npvValue",      npvData.get("npvValue"));
        saveParam.put("irrValue",      npvData.get("irrValue"));
        saveParam.put("paybackPeriod", npvData.get("paybackPeriod"));
        saveParam.put("piValue",       npvData.get("piValue"));

        int cnt = ecDetailRepository.count("Npv", param);
        if (cnt > 0) {
            ecDetailRepository.update("Npv", saveParam);
        } else {
            ecDetailRepository.insert("Npv", saveParam);
        }

        result.put("status", "OK");
        return result;
    }

    /* ═══ Cash Flow 계산 공통 로직 (7개년) ═══ */
    private Map<String, Object> computeCashFlows(double waccRate, double taxRate,
            Map<Integer, Double> yearOperIncome,
            List<Map<String, Object>> lineInvestList,
            List<Map<String, Object>> otherInvestList) {

        List<Map<String, Object>> cashFlowList = new ArrayList<>();
        double[] fcfArray = new double[7];
        double totalInvest = 0, totalOper = 0, totalDepr = 0;
        double totalTax = 0, totalFcf = 0, totalPv = 0;
        double pvInflows = 0, pvInvestments = 0;

        for (int t = 1; t <= 7; t++) {
            // ── 투자비: 해당 연도 취득분 합계 ──
            double investAmt = 0;
            for (Map<String, Object> inv : lineInvestList) {
                // LineInvest: acqYear 없으므로 1년차 취득으로 간주
                if (t == 1) investAmt += toDouble(inv.get("acqAmt"));
            }
            for (Map<String, Object> inv : otherInvestList) {
                int acqYear = toInt(inv.get("acqYear"));
                if (acqYear <= 0) acqYear = 1;
                if (acqYear == t) investAmt += toDouble(inv.get("acqAmt"));
            }

            // ── 영업이익 ──
            double operProfit = yearOperIncome.getOrDefault(t, 0.0);

            // ── 감가상각비: 정액법 (acqAmt / usefulLife) ──
            double depreciation = 0;
            for (Map<String, Object> inv : lineInvestList) {
                int usefulLife = toInt(inv.get("usefulLife"));
                if (usefulLife <= 0) usefulLife = 1;
                if (t >= 1 && t < 1 + usefulLife) {
                    depreciation += toDouble(inv.get("acqAmt")) / usefulLife;
                }
            }
            for (Map<String, Object> inv : otherInvestList) {
                int acqYear = toInt(inv.get("acqYear"));
                if (acqYear <= 0) acqYear = 1;
                int usefulLife = toInt(inv.get("usefulLife"));
                if (usefulLife <= 0) usefulLife = 1;
                if (t >= acqYear && t < acqYear + usefulLife) {
                    depreciation += toDouble(inv.get("acqAmt")) / usefulLife;
                }
            }
            depreciation = Math.round(depreciation);

            // ── 세금 ──
            double taxAmt = operProfit > 0 ? Math.round(operProfit * taxRate / 100) : 0;

            // ── Free Cash Flow ──
            double freeCashFlow = operProfit - taxAmt + depreciation - investAmt;
            fcfArray[t - 1] = freeCashFlow;

            // ── 할인율 & 현재가치 ──
            double discountFactor = 1.0 / Math.pow(1 + waccRate / 100, t);
            double presentValue = Math.round(freeCashFlow * discountFactor);

            Map<String, Object> cfRow = new HashMap<>();
            cfRow.put("yearNm",       "Y+" + t);
            cfRow.put("investAmt",    Math.round(investAmt));
            cfRow.put("operProfit",   Math.round(operProfit));
            cfRow.put("depreciation", Math.round(depreciation));
            cfRow.put("taxAmt",       Math.round(taxAmt));
            cfRow.put("freeCashFlow", Math.round(freeCashFlow));
            cfRow.put("discountRate", Math.round(discountFactor * 10000.0) / 10000.0);
            cfRow.put("presentValue", presentValue);
            cashFlowList.add(cfRow);

            totalInvest += investAmt;
            totalOper   += operProfit;
            totalDepr   += depreciation;
            totalTax    += taxAmt;
            totalFcf    += freeCashFlow;
            totalPv     += presentValue;

            // PI 구성요소
            double operCf = operProfit - taxAmt + depreciation;
            pvInflows     += operCf * discountFactor;
            pvInvestments += investAmt * discountFactor;
        }

        // Total 행
        Map<String, Object> totalRow = new HashMap<>();
        totalRow.put("yearNm",       "Total");
        totalRow.put("investAmt",    Math.round(totalInvest));
        totalRow.put("operProfit",   Math.round(totalOper));
        totalRow.put("depreciation", Math.round(totalDepr));
        totalRow.put("taxAmt",       Math.round(totalTax));
        totalRow.put("freeCashFlow", Math.round(totalFcf));
        totalRow.put("discountRate", 0);
        totalRow.put("presentValue", Math.round(totalPv));
        cashFlowList.add(totalRow);

        Map<String, Object> cfResult = new HashMap<>();
        cfResult.put("cashFlowList",  cashFlowList);
        cfResult.put("fcfArray",      fcfArray);
        cfResult.put("totalPv",       totalPv);
        cfResult.put("pvInflows",     pvInflows);
        cfResult.put("pvInvestments", pvInvestments);
        return cfResult;
    }

    /** IRR 계산: Newton-Raphson 반복법 (max 100회, 수렴 허용오차 1e-7) */
    private double calcIrr(double[] fcf) {
        double r = 0.1;
        for (int iter = 0; iter < 100; iter++) {
            double f = 0, fPrime = 0;
            for (int t = 0; t < fcf.length; t++) {
                double denom = Math.pow(1 + r, t + 1);
                if (Math.abs(denom) < 1e-12) return r * 100;
                f      += fcf[t] / denom;
                fPrime -= (t + 1) * fcf[t] / Math.pow(1 + r, t + 2);
            }
            if (Math.abs(fPrime) < 1e-12) break;
            double rNew = r - f / fPrime;
            if (rNew < -0.99) rNew = -0.99;
            if (rNew > 10.0)  rNew = 10.0;
            if (Math.abs(rNew - r) < 1e-7) { r = rNew; break; }
            r = rNew;
        }
        return r * 100;
    }

    /** Payback Period 계산: 누적 FCF 보간법 */
    private double calcPaybackPeriod(double[] fcf) {
        double cumulative = 0;
        for (int t = 0; t < fcf.length; t++) {
            double prevCum = cumulative;
            cumulative += fcf[t];
            if (cumulative >= 0) {
                if (fcf[t] > 0) {
                    return t + Math.abs(prevCum) / fcf[t];
                }
                return t + 1;
            }
        }
        return fcf.length;
    }

    /* ── 유틸리티 ── */

    private double toDouble(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return 0; }
    }

    private int toInt(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return 0; }
    }

    private String str(Object val) {
        return val != null ? val.toString() : "";
    }

    private double divSafe(double numerator, double denominator) {
        return denominator > 0 ? numerator / denominator : 0;
    }

    /* ═══════════════════════════════════════════════════════════════
       계산 선행조건 종합 검증 (Validation)
       제조경비 → 판관비 → 손익계산서 → NPV 순서로 필수 데이터 점검.
       각 항목을 ERROR / WARNING / INFO 수준으로 분류하여 반환.
       - ERROR   : 계산 불가 (데이터 미등록)
       - WARNING : 계산은 되지만 결과가 부정확할 수 있음 (핵심 필드 0/NULL)
       - INFO    : 권고 사항
       ═══════════════════════════════════════════════════════════════ */
    public Map<String, Object> validateCalcPrereq(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> messages = new ArrayList<>();
        String ecPjtCd = (String) param.get("ecPjtCd");
        Map<String, Object> pjtParam = new HashMap<>();
        pjtParam.put("ecPjtCd", ecPjtCd);

        boolean canCalcMfg = true;
        boolean canCalcSga = true;
        boolean canCalcPl  = true;
        boolean canCalcNpv = true;

        // ── 1. 원가코드 점검 ──
        // estSellPrice: EC의 견적판가 (DB: PCM_EC_COST_CODE.EST_PRICE)
        //   → P&L 매출액 = EST_PRICE × SALES_QTY × (1 − DISC_RATE/100)
        //   → TC(EST_SELL_PRICE), CC(EST_SELL_PRICE) 와 동일 개념, 필드명 통일
        List<Map<String, Object>> costCodes = ecDetailRepository.findList("CostCode", pjtParam);
        if (costCodes == null || costCodes.isEmpty()) {
            messages.add(vmsg("ERROR", "MFG", "원가코드", "원가코드가 등록되지 않았습니다. 제조경비 계산이 불가합니다."));
            canCalcMfg = false;
        } else {
            for (Map<String, Object> cc : costCodes) {
                double estPrice = toDouble(cc.get("estSellPrice"));
                if (estPrice <= 0) {
                    messages.add(vmsg("WARNING", "PL", "원가코드",
                            "원가코드 [" + str(cc.get("costCd")) + "] 예상판가가 0입니다. 매출액이 0으로 산출됩니다."));
                }
            }
        }

        // ── 2. 수량/할인율 점검 ──
        List<Map<String, Object>> qtyDisc = ecDetailRepository.findList("QtyDisc", pjtParam);
        if (qtyDisc == null || qtyDisc.isEmpty()) {
            messages.add(vmsg("ERROR", "MFG", "수량/할인율", "수량/할인율이 등록되지 않았습니다. 제조경비 계산이 불가합니다."));
            canCalcMfg = false;
        } else {
            List<Map<String, Object>> yearSums = ecDetailRepository.findList("QtyDiscYearSum", new HashMap<>(pjtParam));
            boolean hasYear1 = false;
            for (Map<String, Object> ys : yearSums) {
                double totalQty = toDouble(ys.get("totalQty"));
                int yearVal = toInt(ys.get("yearVal"));
                if (yearVal == 1 && totalQty > 0) hasYear1 = true;
                if (totalQty <= 0) {
                    messages.add(vmsg("WARNING", "MFG", "수량/할인율",
                            yearVal + "차년도 판매수량 합계가 0입니다. 단위원가 계산 시 0으로 나누기가 발생합니다."));
                }
            }
            if (!hasYear1) {
                messages.add(vmsg("ERROR", "MFG", "수량/할인율",
                        "1차년도 판매수량이 0입니다. 모든 단위원가가 0으로 계산됩니다."));
            }
        }

        // ── 3. 인원계획 점검 ──
        List<Map<String, Object>> manpower = ecDetailRepository.findList("Manpower", pjtParam);
        if (manpower == null || manpower.isEmpty()) {
            messages.add(vmsg("WARNING", "MFG", "인원계획",
                    "인원계획이 등록되지 않았습니다. 직접/간접노무비가 0으로 산출됩니다."));
        } else {
            boolean hasDirect = false;
            for (Map<String, Object> mp : manpower) {
                String mpType = str(mp.get("mpType"));
                if ("DIRECT".equalsIgnoreCase(mpType)) hasDirect = true;
                if (toDouble(mp.get("avgWage")) <= 0) {
                    messages.add(vmsg("WARNING", "MFG", "인원계획",
                            "[" + str(mp.get("mpNm")) + "] 평균임금이 0입니다. 노무비가 0으로 산출됩니다."));
                }
                if (toDouble(mp.get("y1Cnt")) <= 0) {
                    messages.add(vmsg("WARNING", "MFG", "인원계획",
                            "[" + str(mp.get("mpNm")) + "] 1차년도 인원수가 0입니다."));
                }
            }
            if (!hasDirect) {
                messages.add(vmsg("WARNING", "MFG", "인원계획",
                        "직접인원(DIRECT) 구분의 인원계획이 없습니다. 직접노무비가 0으로 산출됩니다."));
            }
        }

        // ── 4. 투자비 점검 ──
        List<Map<String, Object>> lineInvest = ecDetailRepository.findList("LineInvest", pjtParam);
        List<Map<String, Object>> otherInvest = ecDetailRepository.findList("OtherInvest", pjtParam);

        if ((lineInvest == null || lineInvest.isEmpty())
                && (otherInvest == null || otherInvest.isEmpty())) {
            messages.add(vmsg("INFO", "MFG", "투자비",
                    "라인투자비와 기타투자비가 모두 미등록입니다. 감가상각비가 0으로 산출됩니다."));
        }
        if (lineInvest != null) {
            for (Map<String, Object> inv : lineInvest) {
                if (toDouble(inv.get("acqAmt")) > 0 && toInt(inv.get("usefulLife")) <= 0) {
                    messages.add(vmsg("WARNING", "MFG", "라인투자비",
                            "[" + str(inv.get("lineNm")) + "] 내용연수가 0입니다. 감가상각비 계산이 부정확합니다."));
                }
                if (str(inv.get("lineType")).isEmpty()) {
                    messages.add(vmsg("WARNING", "MFG", "라인투자비",
                            "[" + str(inv.get("lineNm")) + "] 구분(lineType) 코드가 누락되었습니다."));
                }
            }
        }
        if (otherInvest != null) {
            for (Map<String, Object> inv : otherInvest) {
                if (toDouble(inv.get("acqAmt")) > 0 && toInt(inv.get("usefulLife")) <= 0) {
                    messages.add(vmsg("WARNING", "MFG", "기타투자비",
                            "[" + str(inv.get("investNm")) + "] 내용연수가 0입니다. 감가상각비 계산이 부정확합니다."));
                }
                if (str(inv.get("investType")).isEmpty()) {
                    messages.add(vmsg("WARNING", "MFG", "기타투자비",
                            "[" + str(inv.get("investNm")) + "] 투자구분(investType) 코드가 누락되었습니다. 건구축/기타 분류 불가."));
                }
            }
        }

        // ── 5. BOM(재료비) 점검 ──
        List<Map<String, Object>> bomList = ecBomRepository.findListEcBom(pjtParam);
        if (bomList == null || bomList.isEmpty()) {
            messages.add(vmsg("WARNING", "PL", "BOM(재료비)",
                    "BOM이 등록되지 않았습니다. 손익계산서의 재료비가 0으로 산출됩니다."));
        } else {
            int zeroPrice = 0;
            for (Map<String, Object> b : bomList) {
                if (toDouble(b.get("matCost")) <= 0 && toDouble(b.get("unitPrice")) <= 0) zeroPrice++;
            }
            if (zeroPrice > 0) {
                messages.add(vmsg("WARNING", "PL", "BOM(재료비)",
                        "BOM " + zeroPrice + "건의 단가/재료비가 0입니다. 재료비 합계가 과소 산출될 수 있습니다."));
            }
        }

        // ── 6. 제조경비 계산 결과 점검 ──
        int mfgCnt = ecDetailRepository.count("MfgCost", pjtParam);
        if (mfgCnt == 0) {
            if (canCalcMfg) {
                messages.add(vmsg("INFO", "SGA", "제조경비",
                        "제조경비가 아직 계산되지 않았습니다. 판관비 계산 전에 제조경비를 먼저 계산해 주세요."));
            }
            canCalcSga = false;
        }

        // ── 7. 판관비 계산 결과 점검 ──
        int sgaCnt = ecDetailRepository.count("SgaCost", pjtParam);
        if (sgaCnt == 0) {
            if (canCalcSga) {
                messages.add(vmsg("INFO", "PL", "판매관리비",
                        "판매관리비가 아직 계산되지 않았습니다. 손익계산서 산출 전에 판관비를 먼저 계산해 주세요."));
            }
            canCalcPl = false;
        }

        // ── 8. NPV 선행조건 점검 ──
        Map<String, Object> profitData = ecProfitRepository.findEcProfit(pjtParam);
        if (profitData == null) {
            messages.add(vmsg("INFO", "NPV", "수익성기준",
                    "수익성 분석 기준정보(WACC, 세율)가 등록되지 않았습니다. NPV 분석이 불가합니다."));
            canCalcNpv = false;
        } else {
            if (toDouble(profitData.get("waccRate")) <= 0) {
                messages.add(vmsg("WARNING", "NPV", "수익성기준",
                        "WACC Rate가 0입니다. 현재가치 할인이 적용되지 않습니다."));
            }
        }

        // 결과 집계
        int errorCnt = 0, warnCnt = 0, infoCnt = 0;
        for (Map<String, Object> m : messages) {
            String level = str(m.get("level"));
            if ("ERROR".equals(level)) errorCnt++;
            else if ("WARNING".equals(level)) warnCnt++;
            else infoCnt++;
        }

        result.put("status", "OK");
        result.put("messages", messages);
        result.put("errorCount", errorCnt);
        result.put("warningCount", warnCnt);
        result.put("infoCount", infoCnt);
        result.put("canCalcMfg", canCalcMfg);
        result.put("canCalcSga", canCalcSga);
        result.put("canCalcPl", canCalcPl);
        result.put("canCalcNpv", canCalcNpv);

        if (errorCnt == 0 && warnCnt == 0) {
            result.put("summary", "모든 필수 데이터가 정상 등록되어 있습니다.");
        } else if (errorCnt > 0) {
            result.put("summary", "필수 데이터 " + errorCnt + "건 누락. 계산 전 데이터를 보완해 주세요.");
        } else {
            result.put("summary", "경고 " + warnCnt + "건. 계산은 가능하나 결과가 부정확할 수 있습니다.");
        }

        return result;
    }

    private Map<String, Object> vmsg(String level, String calcStep, String category, String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("level", level);
        m.put("calcStep", calcStep);
        m.put("category", category);
        m.put("message", message);
        return m;
    }
}
