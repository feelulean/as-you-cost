/**
 * As-You-Cost DDL 실행 스크립트
 * Supabase Cloud PostgreSQL에 asyoucost 스키마 및 테이블을 생성한다.
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    host: 'aws-1-ap-northeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.zxenhxqhfglorxgibmrz',
    password: 'admin1004!@#$',
    ssl: { rejectUnauthorized: false }
});

const ddlFiles = [
    '00_SCHEMA_INIT.sql',
    'PCM_EC_PJT_MSTR.sql',
    'PCM_CUR_PJT_MSTR.sql',
    'PCM_TGT_PJT_MSTR.sql',
    'PCM_TGT_GUIDE.sql',
    'PCM_EC_BOM.sql',
    'PCM_EC_PROFIT.sql'
];

async function run() {
    try {
        await client.connect();
        console.log('[OK] Supabase 연결 성공');

        for (const file of ddlFiles) {
            const filePath = path.join(__dirname, 'ddl', file);
            const sql = fs.readFileSync(filePath, 'utf8');
            console.log(`\n[>>] ${file} 실행 중...`);
            try {
                await client.query(sql);
                console.log(`[OK] ${file} 완료`);
            } catch (err) {
                console.error(`[ERR] ${file}: ${err.message}`);
            }
        }
    } catch (err) {
        console.error('[ERR] 연결 실패:', err.message);
    } finally {
        await client.end();
        console.log('\n[OK] 연결 종료');
    }
}

run();
