package smartcost.app.bp.cost.ecdetail;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 견적원가 상세 기능 Service
 * - 견적정보 등록(6탭), 투자비, 제조경비, 판관비, 손익, 민감도, NPV
 */
@Service
public class EcDetailService {

    @Inject
    private EcDetailRepository ecDetailRepository;

    /* ═══ 범용 목록 조회 ═══ */
    public List<Map<String, Object>> findList(String entity, Map<String, Object> param) {
        return ecDetailRepository.findList(entity, param);
    }

    /* ═══ 손익계산서 피벗 조회 ═══ */
    public List<Map<String, Object>> findListPlStmtPivot(Map<String, Object> param) {
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

            boolean isBldg = "BLDG".equalsIgnoreCase(investType)
                    || "BUILD".equalsIgnoreCase(investType)
                    || (investType != null && investType.contains("건"));
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

        // 1) 기존 손익계산서 데이터 삭제
        ecDetailRepository.deleteByPjt("PlStmt", param);

        // 2) CostCode + QtyDisc + MfgCost + SgaCost + BOM 조인 → 집계 INSERT
        //    VIEW_TYPE은 SQL에서 'PJT'로 고정
        ecDetailRepository.insertCalcPlStmt(param);

        // 3) 피벗 조회 + basisType 변환 적용
        List<Map<String, Object>> plList = findListPlStmtPivot(param);
        result.put("status", "OK");
        result.put("message", "손익계산서 산출 완료");
        result.put("plList", plList);
        return result;
    }

    /* ═══ NPV 계산 ═══ */
    @Transactional
    public Map<String, Object> calculateNpv(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        int cnt = ecDetailRepository.count("Npv", param);
        if (cnt > 0) {
            ecDetailRepository.update("Npv", param);
        } else {
            ecDetailRepository.insert("Npv", param);
        }
        result.put("status", "OK");
        result.put("message", "NPV 분석 완료");
        return result;
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
}
