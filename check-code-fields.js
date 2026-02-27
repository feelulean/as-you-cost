const { Client } = require('pg');
const client = new Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432, database: 'postgres',
  user: 'postgres.zxenhxqhfglorxgibmrz',
  password: 'admin1004!@#$',
  ssl: { rejectUnauthorized: false },
  options: '-c search_path=asyoucost,public'
});

async function run() {
  await client.connect();
  await client.query("SET search_path TO asyoucost, public");
  const T = "T001";
  const ecPjts = ["EC20260006","EC_TC_S01","EC_TC_R01","EC_TC_M01"];
  const tcPjts = ["TC20260006","TC_S01","TC_R01","TC_M01"];
  const ccPjts = ["CC20260006","CC_S01","CC_R01","CC_M01"];

  function inList(vals) { return vals.map(v => "'" + v + "'").join(","); }
  function mkSql(cols, tbl, wcol, vals, orderBy) {
    return "SELECT " + cols + " FROM " + tbl + " WHERE TEN_ID='" + T + "' AND " + wcol + " IN (" + inList(vals) + ") ORDER BY " + orderBy;
  }

  const queries = [
    ["EC Detail", mkSql("EC_PJT_CD,ORDER_TYPE,FACTORY_TYPE,FACTORY_CD,CORP_TYPE,CORP_CD,ORDER_PROB,DEV_POSS,PRICE_COMP","PCM_EC_DETAIL","EC_PJT_CD",ecPjts,"EC_PJT_CD")],
    ["EC CostCode", mkSql("EC_PJT_CD,COST_CD,PROD_GRP,COST_GRP,EST_CURRENCY,MKT_CURRENCY","PCM_EC_COST_CODE","EC_PJT_CD",ecPjts,"EC_PJT_CD,COST_CD")],
    ["EC Manager", mkSql("EC_PJT_CD,SEQ_NO,DEPT_TYPE,ROLE_TYPE","PCM_EC_MANAGER","EC_PJT_CD",ecPjts,"EC_PJT_CD,SEQ_NO")],
    ["EC LineInvest", mkSql("EC_PJT_CD,LINE_SEQ,LINE_TYPE,LINE_CD,PROCESS_TYPE,ACQ_CURRENCY","PCM_EC_LINE_INVEST","EC_PJT_CD",ecPjts,"EC_PJT_CD")],
    ["EC OtherInvest", mkSql("EC_PJT_CD,INVEST_SEQ,INVEST_NM,INVEST_TYPE,DEPR_TYPE,CURRENCY","PCM_EC_OTHER_INVEST","EC_PJT_CD",ecPjts,"EC_PJT_CD,INVEST_SEQ")],
    ["EC Manpower", mkSql("EC_PJT_CD,MP_SEQ,MP_TYPE,PROCESS_TYPE,CURRENCY","PCM_EC_MANPOWER","EC_PJT_CD",ecPjts,"EC_PJT_CD,MP_SEQ")],
    ["EC MfgCost", mkSql("EC_PJT_CD,COST_CD,CALC_STS","PCM_EC_MFG_COST","EC_PJT_CD",ecPjts,"EC_PJT_CD,COST_CD")],
    ["EC Sensitivity", mkSql("EC_PJT_CD,SENS_VER,SENS_NM,END_YN","PCM_EC_SENSITIVITY","EC_PJT_CD",ecPjts,"EC_PJT_CD")],
    ["EC SensVar", mkSql("EC_PJT_CD,VAR_TYPE,COST_CD","PCM_EC_SENSITIVITY_VAR","EC_PJT_CD",ecPjts,"EC_PJT_CD")],
    ["EC FundPlan", mkSql("EC_PJT_CD,FUND_SEQ,SOURCE_TYPE,CURRENCY,INTEREST_RATE","PCM_EC_FUND_PLAN","EC_PJT_CD",ecPjts,"EC_PJT_CD")],
    ["EC NPV", mkSql("EC_PJT_CD,ANALYSIS_VER,ANALYSIS_TYPE,WACC_RATE","PCM_EC_NPV","EC_PJT_CD",ecPjts,"EC_PJT_CD")],
    ["EC BOM (sample)", mkSql("EC_PJT_CD,ITEM_CD,STS,NEW_PART_YN","PCM_EC_BOM","EC_PJT_CD",ecPjts,"EC_PJT_CD,ITEM_CD LIMIT 20")],
    ["TC Manager", mkSql("TGT_PJT_CD,MGR_SEQ,DEPT_DIV,ROLE_CD,STS","PCM_TGT_MANAGER","TGT_PJT_CD",tcPjts,"TGT_PJT_CD,MGR_SEQ")],
    ["TC Spec", mkSql("TGT_PJT_CD,SPEC_SEQ,TGT_COST_CD,SEL_YN,STS","PCM_TGT_SPEC","TGT_PJT_CD",tcPjts,"TGT_PJT_CD,SPEC_SEQ")],
    ["TC DevSchedule", mkSql("TGT_PJT_CD,SCHED_SEQ,SCHED_TYPE,PROC_YN,STS","PCM_TGT_DEV_SCHEDULE","TGT_PJT_CD",tcPjts,"TGT_PJT_CD,SCHED_SEQ")],
    ["TC CostReg", mkSql("TGT_PJT_CD,COST_SEQ,COST_ITEM_CD,CONFIRM_YN,VIEW_MODE,STS","PCM_TGT_COST_REG","TGT_PJT_CD",tcPjts,"TGT_PJT_CD,COST_SEQ")],
    ["CC Detail", mkSql("CC_PJT_CD,FACTORY_DIV,FACTORY_CD,CORP_DIV,CORP_CD,COMPOSE_YN,STS","PCM_CUR_DETAIL","CC_PJT_CD",ccPjts,"CC_PJT_CD")],
    ["CC CostCode", mkSql("CC_PJT_CD,COST_SEQ,COST_CD,CALC_TARGET,CURRENCY,STS","PCM_CUR_COST_CODE","CC_PJT_CD",ccPjts,"CC_PJT_CD,COST_SEQ")],
    ["CC Manager", mkSql("CC_PJT_CD,MGR_SEQ,DEPT_DIV,ROLE_CD,STS","PCM_CUR_MANAGER","CC_PJT_CD",ccPjts,"CC_PJT_CD,MGR_SEQ")],
    ["CC Schedule", mkSql("CC_PJT_CD,SCHED_SEQ,TASK_NM,PROC_STS,STS","PCM_CUR_SCHEDULE","CC_PJT_CD",ccPjts,"CC_PJT_CD,SCHED_SEQ")],
    ["CC BOM (sample)", mkSql("CC_PJT_CD,BOM_SEQ,PART_NO,PART_DIV,RECV_UNIT_YN,STS","PCM_CUR_BOM","CC_PJT_CD",ccPjts,"CC_PJT_CD,BOM_SEQ LIMIT 20")],
  ];

  // Common codes - check column names first
  var grpList = [];
  for(var i=1;i<=50;i++) grpList.push("T"+String(i).padStart(3,"0"));
  queries.push(["Common Codes", "SELECT GRP_CD,DTL_CD,CD_NM FROM PCM_COM_DTL_CD WHERE TEN_ID='"+T+"' AND GRP_CD IN ("+inList(grpList)+") ORDER BY GRP_CD,SORT_NO LIMIT 200"]);
  queries.push(["Common Code Groups", "SELECT GRP_CD,GRP_NM FROM PCM_COM_GRP_CD WHERE TEN_ID='"+T+"' ORDER BY GRP_CD LIMIT 100"]);
  queries.push(["DTL_CD columns", "SELECT column_name FROM information_schema.columns WHERE table_schema='asyoucost' AND table_name='pcm_com_dtl_cd' ORDER BY ordinal_position"]);

  for (const [label, sql] of queries) {
    try {
      const res = await client.query(sql);
      console.log("");
      console.log("=== " + label + " (" + res.rows.length + " rows) ===");
      res.rows.forEach(r => {
        const vals = Object.entries(r).map(([k,v]) => k + "=" + v).join(" | ");
        console.log("  " + vals);
      });
    } catch(e) {
      console.log("");
      console.log("=== " + label + " === ERROR: " + e.message);
    }
  }

  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });