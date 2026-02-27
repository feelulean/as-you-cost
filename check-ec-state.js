const { Client } = require("pg");
const client = new Client({
  host: "aws-1-ap-northeast-1.pooler.supabase.com",
  port: 5432, database: "postgres",
  user: "postgres.zxenhxqhfglorxgibmrz",
  password: "admin1004!@#$",
  ssl: { rejectUnauthorized: false },
  options: "-c search_path=asyoucost,public"
});

async function run() {
  await client.connect();
  await client.query("SET search_path TO asyoucost, public");

  var ecTables = [
    ["PCM_EC_PJT_MSTR", "SELECT * FROM PCM_EC_PJT_MSTR WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_DETAIL", "SELECT * FROM PCM_EC_DETAIL WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_COST_CODE", "SELECT * FROM PCM_EC_COST_CODE WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_QTY_DISC", "SELECT * FROM PCM_EC_QTY_DISC WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_MANAGER", "SELECT * FROM PCM_EC_MANAGER WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_SCHEDULE", "SELECT * FROM PCM_EC_SCHEDULE WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_LINE_INVEST", "SELECT * FROM PCM_EC_LINE_INVEST WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_OTHER_INVEST", "SELECT * FROM PCM_EC_OTHER_INVEST WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_MANPOWER", "SELECT * FROM PCM_EC_MANPOWER WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_MFG_COST", "SELECT * FROM PCM_EC_MFG_COST WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_SGA_COST", "SELECT * FROM PCM_EC_SGA_COST WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_BOM", "SELECT * FROM PCM_EC_BOM WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_PL_STMT", "SELECT * FROM PCM_EC_PL_STMT WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_SENSITIVITY", "SELECT * FROM PCM_EC_SENSITIVITY WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_SENSITIVITY_VAR", "SELECT * FROM PCM_EC_SENSITIVITY_VAR WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_FUND_PLAN", "SELECT * FROM PCM_EC_FUND_PLAN WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_NPV", "SELECT * FROM PCM_EC_NPV WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
    ["PCM_EC_PROFIT", "SELECT * FROM PCM_EC_PROFIT WHERE TEN_ID=$1 AND EC_PJT_CD=$2", ["T001", "EC20260006"]],
  ];

  var tcTables = [
    ["PCM_TGT_PJT_MSTR", "SELECT * FROM PCM_TGT_PJT_MSTR WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_MANAGER", "SELECT * FROM PCM_TGT_MANAGER WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_SPEC", "SELECT * FROM PCM_TGT_SPEC WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_PRICE", "SELECT * FROM PCM_TGT_PRICE WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_QTY_DISC", "SELECT * FROM PCM_TGT_QTY_DISC WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_DEV_SCHEDULE", "SELECT * FROM PCM_TGT_DEV_SCHEDULE WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_SETUP_SCHEDULE", "SELECT * FROM PCM_TGT_SETUP_SCHEDULE WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_GUIDE", "SELECT * FROM PCM_TGT_GUIDE WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_COST_REG", "SELECT * FROM PCM_TGT_COST_REG WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_ACHV_PLAN", "SELECT * FROM PCM_TGT_ACHV_PLAN WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_ACHV_PLAN_DTL", "SELECT * FROM PCM_TGT_ACHV_PLAN_DTL WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_RECALC", "SELECT * FROM PCM_TGT_RECALC WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
    ["PCM_TGT_ACHV_STATUS", "SELECT * FROM PCM_TGT_ACHV_STATUS WHERE TEN_ID=$1 AND TGT_PJT_CD=$2", ["T001", "TC20260006"]],
  ];

  var ccTables = [
    ["PCM_CUR_PJT_MSTR", "SELECT * FROM PCM_CUR_PJT_MSTR WHERE TEN_ID=$1 AND CC_PJT_CD=$2", ["T001", "CC20260006"]],
    ["PCM_CUR_DETAIL", "SELECT * FROM PCM_CUR_DETAIL WHERE TEN_ID=$1 AND CC_PJT_CD=$2", ["T001", "CC20260006"]],
    ["PCM_CUR_COST_CODE", "SELECT * FROM PCM_CUR_COST_CODE WHERE TEN_ID=$1 AND CC_PJT_CD=$2", ["T001", "CC20260006"]],
    ["PCM_CUR_QTY_DISC", "SELECT * FROM PCM_CUR_QTY_DISC WHERE TEN_ID=$1 AND CC_PJT_CD=$2", ["T001", "CC20260006"]],
    ["PCM_CUR_MANAGER", "SELECT * FROM PCM_CUR_MANAGER WHERE TEN_ID=$1 AND CC_PJT_CD=$2", ["T001", "CC20260006"]],
    ["PCM_CUR_SCHEDULE", "SELECT * FROM PCM_CUR_SCHEDULE WHERE TEN_ID=$1 AND CC_PJT_CD=$2", ["T001", "CC20260006"]],
    ["PCM_CUR_BOM", "SELECT * FROM PCM_CUR_BOM WHERE TEN_ID=$1 AND CC_PJT_CD=$2", ["T001", "CC20260006"]],
    ["PCM_CUR_PART_PRICE", "SELECT * FROM PCM_CUR_PART_PRICE WHERE TEN_ID=$1 AND CC_PJT_CD=$2", ["T001", "CC20260006"]],
    ["PCM_CUR_ACT_EVAL", "SELECT * FROM PCM_CUR_ACT_EVAL WHERE TEN_ID=$1 AND CC_PJT_CD=$2", ["T001", "CC20260006"]],
    ["PCM_CUR_ACHV_EVAL", "SELECT * FROM PCM_CUR_ACHV_EVAL WHERE TEN_ID=$1 AND CUR_PJT_CD=$2", ["T001", "CC20260006"]],
  ];

  for (var tables of [ecTables, tcTables, ccTables]) {
    for (var entry of tables) {
      var name = entry[0], sql = entry[1], params = entry[2];
      try {
        var res = await client.query(sql, params);
        var nullCols = [];
        if (res.rows.length > 0) {
          var row = res.rows[0];
          Object.entries(row).forEach(function(pair) {
            if (pair[1] === null) nullCols.push(pair[0]);
          });
        }
        var msg = name + ": " + res.rows.length + " rows";
        if (nullCols.length > 0) msg += " | NULL cols: " + nullCols.join(", ");
        console.log(msg);
        if (res.rows.length > 0 && res.rows.length <= 5) {
          res.rows.forEach(function(r, i) {
            var keys = Object.keys(r).filter(function(k) {
              return k !== "ten_id" && k !== "regr_id" && k !== "reg_dttm" && k !== "modr_id" && k !== "mod_dttm";
            });
            var vals = keys.map(function(k) { return k + "=" + r[k]; }).join(", ");
            console.log("  [" + i + "] " + vals);
          });
        }
      } catch(e) {
        console.log(name + ": ERROR - " + e.message);
      }
    }
  }

  console.log("");
  console.log("=== TEST PROJECTS STATUS ===");
  var testEc = await client.query("SELECT EC_PJT_CD, PJT_NM FROM PCM_EC_PJT_MSTR WHERE TEN_ID=$1 AND EC_PJT_CD IN ($2,$3,$4)", ["T001", "EC_TC_S01", "EC_TC_R01", "EC_TC_M01"]);
  console.log("Test EC projects: " + testEc.rows.length);
  testEc.rows.forEach(function(r) { console.log("  " + r.ec_pjt_cd + ": " + r.pjt_nm); });

  var testTc = await client.query("SELECT TGT_PJT_CD, PJT_NM FROM PCM_TGT_PJT_MSTR WHERE TEN_ID=$1 AND TGT_PJT_CD IN ($2,$3,$4)", ["T001", "TC_S01", "TC_R01", "TC_M01"]);
  console.log("Test TC projects: " + testTc.rows.length);

  var testCc = await client.query("SELECT CC_PJT_CD, PJT_NM FROM PCM_CUR_PJT_MSTR WHERE TEN_ID=$1 AND CC_PJT_CD IN ($2,$3,$4)", ["T001", "CC_S01", "CC_R01", "CC_M01"]);
  console.log("Test CC projects: " + testCc.rows.length);

  await client.end();
}

run().catch(function(e) { console.error(e); process.exit(1); });
