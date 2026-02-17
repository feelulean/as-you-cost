package smartcost.app.bp.cost.ccdetail;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 현상원가 상세 기능 Service
 * - 현상원가 등록(상세정보, 원가코드, 수량/할인율, 담당자, 일정,
 *   BOM, BOM맵핑, 부품단가, 라인투자비, 라인투자비상세, 라인CT, 기타투자비,
 *   인원계획, 제조경비, 판관비, 손익, 차이분석, 달성도평가상세, 실적평가, 실적자재비)
 */
@Service
public class CcDetailService {

    @Inject
    private CcDetailRepository ccDetailRepository;

    /* ═══ 범용 목록 조회 ═══ */
    public List<Map<String, Object>> findList(String entity, Map<String, Object> param) {
        return ccDetailRepository.findList(entity, param);
    }

    /* ═══ 현상원가 상세 단건 조회 ═══ */
    public Map<String, Object> findCcDetail(Map<String, Object> param) {
        Map<String, Object> result = ccDetailRepository.findOne("CcDetail", param);
        if (result == null) result = new HashMap<>();
        return result;
    }

    /* ═══ 현상원가 상세 저장 (Insert or Update) ═══ */
    @Transactional
    public Map<String, Object> saveCcDetail(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        int cnt = ccDetailRepository.count("CcDetail", param);
        if (cnt > 0) {
            ccDetailRepository.update("CcDetail", param);
        } else {
            ccDetailRepository.insert("CcDetail", param);
        }
        result.put("status", "OK");
        return result;
    }

    /* ═══ 범용 목록 저장 (Insert/Update by _rowStatus) ═══ */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> saveList(String entity, Map<String, Object> param) {
        List<Map<String, Object>> saveList = (List<Map<String, Object>>) param.get("saveList");
        String ccPjtCd = (String) param.get("ccPjtCd");
        Object ccRev = param.get("ccRev");
        Map<String, Object> result = new HashMap<>();

        if (saveList != null) {
            for (Map<String, Object> row : saveList) {
                if (ccPjtCd != null && !row.containsKey("ccPjtCd")) row.put("ccPjtCd", ccPjtCd);
                if (ccRev != null && !row.containsKey("ccRev")) row.put("ccRev", ccRev);

                String rowStatus = row.containsKey("_rowStatus")
                        ? (String) row.get("_rowStatus") : "U";

                if ("C".equals(rowStatus)) {
                    ccDetailRepository.insert(entity, row);
                } else {
                    ccDetailRepository.update(entity, row);
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
        String ccPjtCd = (String) param.get("ccPjtCd");
        Object ccRev = param.get("ccRev");
        Map<String, Object> result = new HashMap<>();

        if (deleteList != null) {
            for (Map<String, Object> row : deleteList) {
                if (ccPjtCd != null && !row.containsKey("ccPjtCd")) row.put("ccPjtCd", ccPjtCd);
                if (ccRev != null && !row.containsKey("ccRev")) row.put("ccRev", ccRev);
                ccDetailRepository.delete(entity, row);
            }
        }
        result.put("status", "OK");
        result.put("count", deleteList != null ? deleteList.size() : 0);
        return result;
    }

    /* ═══ 제조경비 계산 ═══ */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> calculateMfgCost(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();

        // 선행조건: 원가코드 + 수량/할인율 등록 여부
        int costCodeCnt = ccDetailRepository.count("CostCodeAll", param);
        int qtyDiscCnt  = ccDetailRepository.count("QtyDiscAll", param);
        if (costCodeCnt == 0 || qtyDiscCnt == 0) {
            result.put("status", "FAIL");
            result.put("message", "원가코드 및 수량/할인율을 먼저 등록해 주세요.");
            return result;
        }

        String ccPjtCd = (String) param.get("ccPjtCd");
        Object ccRev   = param.get("ccRev");
        String costCd  = (String) param.get("costCd");

        double wageIncRate      = toD(param.get("wageIncRate"));
        double inflationRate    = toD(param.get("inflationRate"));
        double prodDirectRate   = toD(param.get("prodDirectRate"));
        double laborRelatedRate = toD(param.get("laborRelatedRate"));
        double etcMfgRate       = toD(param.get("etcMfgRate"));
        double moldCostUnit     = toD(param.get("moldCostUnit"));
        double outsrcCostUnit   = toD(param.get("outsrcCostUnit"));

        // ── 인원계획 조회 ──
        Map<String, Object> pjtParam = new HashMap<>();
        pjtParam.put("ccPjtCd", ccPjtCd);
        pjtParam.put("ccRev", ccRev);
        List<Map<String, Object>> manpowerList = ccDetailRepository.findList("Manpower", pjtParam);

        // ── 라인투자비 상세 조회 (감가상각 계산용) ──
        List<Map<String, Object>> lineInvestDtlList = ccDetailRepository.findList("LineInvestDtl", pjtParam);
        // 라인투자비 (usefulLife 없으면 상세에서)
        List<Map<String, Object>> lineInvestList = ccDetailRepository.findList("LineInvest", pjtParam);

        // ── 기타투자비 조회 ──
        List<Map<String, Object>> otherInvestList = ccDetailRepository.findList("OtherInvest", pjtParam);

        // ── 수량/할인율 조회 (연도별 수량) ──
        List<Map<String, Object>> qtyList = ccDetailRepository.findList("QtyDisc", pjtParam);
        Map<String, Double> yearQty = new HashMap<>();
        for (Map<String, Object> q : qtyList) {
            yearQty.put(str(q.get("yearVal")), toD(q.get("sellQty")));
        }
        // 첫 연도 수량 (단위원가 계산 기준)
        double firstYearQty = qtyList.isEmpty() ? 0 : toD(qtyList.get(0).get("sellQty"));

        /* ═══ 직접노무비 / 간접노무비 ═══ */
        double sumDirectLabor = 0, sumIndirectLabor = 0;
        for (Map<String, Object> mp : manpowerList) {
            String mpDiv = str(mp.get("mpDiv"));
            double avgSalary  = toD(mp.get("avgSalary"));
            double headCount  = toD(mp.get("headCount"));
            double annualCost = avgSalary * headCount;
            double unitCost   = firstYearQty > 0 ? Math.round(annualCost / firstYearQty) : 0;

            if ("DIRECT".equalsIgnoreCase(mpDiv)) {
                sumDirectLabor += unitCost;
            } else {
                sumIndirectLabor += unitCost;
            }
        }

        /* ═══ 비율 기반 원가 ═══ */
        double prodDirectAmt   = Math.round(sumDirectLabor * prodDirectRate / 100);
        double laborRelatedAmt = Math.round((sumDirectLabor + sumIndirectLabor) * laborRelatedRate / 100);
        double otherMfgAmt     = Math.round((sumDirectLabor + sumIndirectLabor) * etcMfgRate / 100);

        /* ═══ 감가상각비 — 라인투자비 ═══ */
        double sumDeprLine = 0;
        if (!lineInvestDtlList.isEmpty()) {
            for (Map<String, Object> dtl : lineInvestDtlList) {
                double acqAmt = toD(dtl.get("amt"));
                int usefulLife = toInt(dtl.get("usefulLife"));
                if (usefulLife <= 0) usefulLife = 1;
                double annualDepr = Math.round(acqAmt / usefulLife);
                sumDeprLine += firstYearQty > 0 ? Math.round(annualDepr / firstYearQty) : 0;
            }
        } else {
            for (Map<String, Object> inv : lineInvestList) {
                double acqAmt = toD(inv.get("acqAmt"));
                double capaEa = toD(inv.get("capaEa"));
                if (capaEa <= 0) capaEa = firstYearQty > 0 ? firstYearQty : 1;
                sumDeprLine += Math.round(acqAmt / capaEa);
            }
        }

        /* ═══ 감가상각비 — 기타투자비 ═══ */
        double sumDeprBldg = 0, sumDeprOther = 0;
        for (Map<String, Object> inv : otherInvestList) {
            String investDiv = str(inv.get("investDiv"));
            double acqAmt = toD(inv.get("acqAmt"));
            int usefulLife = toInt(inv.get("usefulLife"));
            if (usefulLife <= 0) usefulLife = 1;
            double annualDepr = Math.round(acqAmt / usefulLife);
            double unitDepr = firstYearQty > 0 ? Math.round(annualDepr / firstYearQty) : 0;

            if ("BLDG".equalsIgnoreCase(investDiv) || "BUILD".equalsIgnoreCase(investDiv)) {
                sumDeprBldg += unitDepr;
            } else {
                sumDeprOther += unitDepr;
            }
        }

        /* ═══ 결과 요약 ═══ */
        double totalMfgAmt = sumDirectLabor + sumIndirectLabor
                + prodDirectAmt + laborRelatedAmt + otherMfgAmt
                + sumDeprBldg + sumDeprLine + sumDeprOther
                + outsrcCostUnit + moldCostUnit;

        // DB 저장
        Map<String, Object> saveParam = new HashMap<>(param);
        saveParam.put("directLaborAmt",   sumDirectLabor);
        saveParam.put("indirectLaborAmt", sumIndirectLabor);
        saveParam.put("directExpAmt",     prodDirectAmt);
        saveParam.put("laborExpAmt",      laborRelatedAmt);
        saveParam.put("otherMfgAmt",      otherMfgAmt);
        saveParam.put("deprBldgAmt",      sumDeprBldg);
        saveParam.put("deprLineAmt",      sumDeprLine);
        saveParam.put("deprOtherAmt",     sumDeprOther);
        saveParam.put("outsrcAmt",        outsrcCostUnit);
        saveParam.put("moldAmt",          moldCostUnit);
        saveParam.put("rndAmt",           0.0);
        saveParam.put("otherExpAmt",      0.0);
        saveParam.put("totalMfgAmt",      totalMfgAmt);
        saveParam.put("calcDoneYn",       "Y");

        int cnt = ccDetailRepository.count("MfgCost", saveParam);
        if (cnt > 0) {
            ccDetailRepository.update("MfgCost", saveParam);
        } else {
            ccDetailRepository.insert("MfgCost", saveParam);
        }

        result.put("status", "OK");
        result.put("message", "제조경비 계산 완료");
        result.put("totalMfgAmt", totalMfgAmt);
        return result;
    }

    /* ═══ 판매관리비 계산 ═══ */
    @Transactional
    public Map<String, Object> calculateSgaCost(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();

        // 선행조건: 제조경비 계산 완료 여부
        Map<String, Object> chkParam = new HashMap<>(param);
        // costCd 없이 프로젝트 전체에서 확인
        int mfgCnt = ccDetailRepository.count("MfgCost", chkParam);
        if (mfgCnt == 0) {
            result.put("status", "FAIL");
            result.put("message", "제조경비를 먼저 계산해 주세요.");
            return result;
        }

        // 비율 추출
        double salesLaborRate  = toD(param.get("salesLaborRate"));
        double transportRate   = toD(param.get("transportRate"));
        double exportRate      = toD(param.get("exportRate"));
        double warrantyRate    = toD(param.get("warrantyRate"));
        double advertisingRate = toD(param.get("advertisingRate"));
        double researchRate    = toD(param.get("researchRate"));
        double assetCostRate   = toD(param.get("assetCostRate"));
        double hrCostRate      = toD(param.get("hrCostRate"));
        double etcRate         = toD(param.get("etcRate"));
        double totalRate = salesLaborRate + transportRate + exportRate + warrantyRate
                         + advertisingRate + researchRate + assetCostRate + hrCostRate + etcRate;

        // 제조경비 총액 조회
        List<Map<String, Object>> mfgList = ccDetailRepository.findList("MfgCost", param);
        double mfgTotal = 0;
        for (Map<String, Object> mc : mfgList) {
            mfgTotal += toD(mc.get("totalMfgAmt"));
        }

        // 항목별 금액 계산
        double totalSgaAmt = Math.round(mfgTotal * totalRate / 100.0);
        double salesLaborAmt  = totalRate > 0 ? Math.round(totalSgaAmt * salesLaborRate / totalRate) : 0;
        double transportAmt   = totalRate > 0 ? Math.round(totalSgaAmt * transportRate / totalRate) : 0;
        double exportAmt      = totalRate > 0 ? Math.round(totalSgaAmt * exportRate / totalRate) : 0;
        double warrantyAmt    = totalRate > 0 ? Math.round(totalSgaAmt * warrantyRate / totalRate) : 0;
        double advertisingAmt = totalRate > 0 ? Math.round(totalSgaAmt * advertisingRate / totalRate) : 0;
        double researchAmt    = totalRate > 0 ? Math.round(totalSgaAmt * researchRate / totalRate) : 0;
        double assetCostAmt   = totalRate > 0 ? Math.round(totalSgaAmt * assetCostRate / totalRate) : 0;
        double hrCostAmt      = totalRate > 0 ? Math.round(totalSgaAmt * hrCostRate / totalRate) : 0;
        double etcAmt         = totalRate > 0 ? Math.round(totalSgaAmt * etcRate / totalRate) : 0;

        Map<String, Object> saveParam = new HashMap<>(param);
        saveParam.put("salesLaborAmt",  salesLaborAmt);
        saveParam.put("transportAmt",   transportAmt);
        saveParam.put("exportAmt",      exportAmt);
        saveParam.put("warrantyAmt",    warrantyAmt);
        saveParam.put("advertisingAmt", advertisingAmt);
        saveParam.put("researchAmt",    researchAmt);
        saveParam.put("assetCostAmt",   assetCostAmt);
        saveParam.put("hrCostAmt",      hrCostAmt);
        saveParam.put("etcAmt",         etcAmt);
        saveParam.put("totalSgaAmt",    totalSgaAmt);
        saveParam.put("calcDoneYn",     "Y");

        int cnt = ccDetailRepository.count("SgaCost", saveParam);
        if (cnt > 0) {
            ccDetailRepository.update("SgaCost", saveParam);
        } else {
            ccDetailRepository.insert("SgaCost", saveParam);
        }

        result.put("status", "OK");
        result.put("message", "판매관리비 계산 완료");
        result.put("totalSgaAmt", totalSgaAmt);
        return result;
    }

    /* ═══ 손익계산서 산출 ═══ */
    @Transactional
    public Map<String, Object> calculatePlStmt(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();

        // 선행조건: 제조경비 + 판매관리비
        Map<String, Object> chkParam = new HashMap<>(param);
        // costCd가 있으면 그걸로, 없으면 프로젝트 전체
        int mfgCnt = ccDetailRepository.count("MfgCost", chkParam);
        if (mfgCnt == 0) {
            result.put("status", "FAIL");
            result.put("message", "제조경비를 먼저 계산해 주세요.");
            return result;
        }
        int sgaCnt = ccDetailRepository.count("SgaCost", chkParam);
        if (sgaCnt == 0) {
            result.put("status", "FAIL");
            result.put("message", "판매관리비를 먼저 계산해 주세요.");
            return result;
        }

        // 기존 P&L 데이터 삭제
        ccDetailRepository.delete("AllPlStmt", param);

        // INSERT...SELECT로 P&L 산출
        ccDetailRepository.insert("CalcPlStmt", param);

        // 결과 조회
        List<Map<String, Object>> plList = ccDetailRepository.findList("PlStmt", param);
        result.put("status", "OK");
        result.put("message", "손익계산서 산출 완료");
        result.put("plList", plList);
        return result;
    }

    /* ═══ 차이분석 생성 (2-Step Diff: EC↔TC, TC↔CC) ═══ */
    @Transactional
    public Map<String, Object> generateDiffAnalysis(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();

        // 1) 기존 차이분석 전체 삭제
        ccDetailRepository.delete("AllDiffAnalysis", param);

        // 2) TC 원가등록 합계 조회 (EC금액 + TC목표금액 포함)
        Map<String, Object> tcParam = new HashMap<>(param);
        tcParam.put("tgtPjtCd", param.get("tgtPjtCd"));
        List<Map<String, Object>> tcItems = ccDetailRepository.findList("TcCostSummary", tcParam);

        // 3) CC 손익계산서 합계 조회 (단가 기준)
        List<Map<String, Object>> ccItems = ccDetailRepository.findList("CcPlSummary", param);

        // CC 항목명 → 단가 lookup (이름 기준)
        Map<String, Double> ccLookup = new HashMap<>();
        for (Map<String, Object> cc : ccItems) {
            ccLookup.put((String) cc.get("costItem"), toD(cc.get("unitAmt")));
        }

        // 코드 → CC 한글 항목명 매핑 (TC 항목명이 영문인 경우 대비)
        Map<String, String> codeToKr = new HashMap<>();
        codeToKr.put("MAT", "재료비");
        codeToKr.put("LABOR", "노무비");
        codeToKr.put("MFG", "제조경비");
        codeToKr.put("SGA", "판관비");
        codeToKr.put("SALES", "매출액");
        codeToKr.put("OPER", "영업이익");

        int seq = 0;
        double cumEc = 0, cumCc = 0, cumDiff = 0;

        // ── Step 1: EC vs TC (절감 목표 분석) ──
        for (Map<String, Object> tc : tcItems) {
            seq++;
            double ecAmt  = toD(tc.get("ecCostAmt"));
            double tcAmt  = toD(tc.get("finalTgtAmt"));
            double diffAmt = ecAmt - tcAmt;
            double diffRate = ecAmt != 0 ? round4(diffAmt / ecAmt) : 0;

            cumEc += ecAmt; cumCc += tcAmt; cumDiff += diffAmt;

            Map<String, Object> row = new HashMap<>(param);
            row.put("diffSeq",    seq);
            row.put("diffType",   "EC_TC");
            row.put("costItemCd", tc.get("costItemCd"));
            row.put("costItemNm", tc.get("costItemNm"));
            row.put("ecAmt",      round2(ecAmt));
            row.put("ccAmt",      round2(tcAmt));
            row.put("diffAmt",    round2(diffAmt));
            row.put("diffRate",   diffRate);
            row.put("cumEcAmt",   round2(cumEc));
            row.put("cumCcAmt",   round2(cumCc));
            row.put("cumDiffAmt", round2(cumDiff));
            row.put("rmk", "");
            row.put("sts", "Y");
            ccDetailRepository.insert("DiffAnalysis", row);
        }

        // ── Step 2: TC vs CC (현상 변동 분석) ──
        seq = 0; cumEc = 0; cumCc = 0; cumDiff = 0;

        for (Map<String, Object> tc : tcItems) {
            seq++;
            String costItemCd = (String) tc.get("costItemCd");
            String costItemNm = (String) tc.get("costItemNm");
            double tcAmt = toD(tc.get("finalTgtAmt"));
            // 이름 매칭 → 실패 시 코드→한글 매핑으로 재시도
            Double ccVal = ccLookup.get(costItemNm);
            if (ccVal == null && codeToKr.containsKey(costItemCd)) {
                ccVal = ccLookup.get(codeToKr.get(costItemCd));
            }
            double ccAmt = ccVal != null ? ccVal : 0;
            double diffAmt  = tcAmt - ccAmt;
            double diffRate = tcAmt != 0 ? round4(diffAmt / tcAmt) : 0;

            cumEc += tcAmt; cumCc += ccAmt; cumDiff += diffAmt;

            Map<String, Object> row = new HashMap<>(param);
            row.put("diffSeq",    seq);
            row.put("diffType",   "TC_CC");
            row.put("costItemCd", tc.get("costItemCd"));
            row.put("costItemNm", costItemNm);
            row.put("ecAmt",      round2(tcAmt));
            row.put("ccAmt",      round2(ccAmt));
            row.put("diffAmt",    round2(diffAmt));
            row.put("diffRate",   diffRate);
            row.put("cumEcAmt",   round2(cumEc));
            row.put("cumCcAmt",   round2(cumCc));
            row.put("cumDiffAmt", round2(cumDiff));
            row.put("rmk", "");
            row.put("sts", "Y");
            ccDetailRepository.insert("DiffAnalysis", row);
        }

        int totalRows = tcItems.size() * 2;
        result.put("status", "OK");
        result.put("message", "차이분석 생성 완료 (EC↔TC " + tcItems.size() + "건, TC↔CC " + tcItems.size() + "건)");
        result.put("count", totalRows);
        return result;
    }

    /* ── 유틸리티 ── */

    private double toD(Object val) {
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

    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }

    private double round4(double v) { return Math.round(v * 10000.0) / 10000.0; }

    /* ═══ 달성도 평가 상세 생성 ═══ */
    @Transactional
    public Map<String, Object> generateAchvEvalDtl(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 목표원가 대비 현상원가 달성도 평가 상세 데이터 생성
        int cnt = ccDetailRepository.count("AchvEvalDtl", param);
        if (cnt > 0) {
            ccDetailRepository.update("AchvEvalDtl", param);
        } else {
            ccDetailRepository.insert("AchvEvalDtl", param);
        }
        result.put("status", "OK");
        result.put("message", "달성도 평가 상세 생성 완료");
        return result;
    }

    /* ═══ 실적평가 생성 ═══ */
    @Transactional
    public Map<String, Object> generateActEval(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 실적 기반 평가 데이터 생성
        int cnt = ccDetailRepository.count("ActEval", param);
        if (cnt > 0) {
            ccDetailRepository.update("ActEval", param);
        } else {
            ccDetailRepository.insert("ActEval", param);
        }
        result.put("status", "OK");
        result.put("message", "실적평가 생성 완료");
        return result;
    }

    /* ═══ 실적자재비 계산 ═══ */
    @Transactional
    public Map<String, Object> calculateActMaterial(Map<String, Object> param) {
        Map<String, Object> result = new HashMap<>();
        // 실적 자재비 = BOM 기준 실적 단가 x 수량 합산
        int cnt = ccDetailRepository.count("ActMaterial", param);
        if (cnt > 0) {
            ccDetailRepository.update("ActMaterial", param);
        } else {
            ccDetailRepository.insert("ActMaterial", param);
        }
        result.put("status", "OK");
        result.put("message", "실적자재비 계산 완료");
        return result;
    }
}
