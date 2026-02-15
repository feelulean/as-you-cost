package smartcost.config;

import javax.sql.DataSource;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * As-You-Cost 데이터베이스 설정
 *
 * - DataSource: HikariCP + Supabase Cloud PostgreSQL (PgBouncer Pooler)
 * - ORM: MyBatis 3.5 (3.4 호환) + mybatis-spring
 * - Transaction: Spring @Transactional 지원
 *
 * 01_architecture.md 기준:
 *   Resource Access Layer → Data Layer (Supabase PostgreSQL)
 */
@Configuration
@PropertySource("classpath:config/datasource.properties")
@EnableTransactionManagement
public class DatabaseConfig {

    /* ── datasource.properties 값 주입 ── */
    @Value("${datasource.driver-class-name}")
    private String driverClassName;

    @Value("${datasource.url}")
    private String jdbcUrl;

    @Value("${datasource.username}")
    private String username;

    @Value("${datasource.password}")
    private String password;

    @Value("${datasource.hikari.maximum-pool-size}")
    private int maximumPoolSize;

    @Value("${datasource.hikari.minimum-idle}")
    private int minimumIdle;

    @Value("${datasource.hikari.idle-timeout}")
    private long idleTimeout;

    @Value("${datasource.hikari.max-lifetime}")
    private long maxLifetime;

    @Value("${datasource.hikari.connection-timeout}")
    private long connectionTimeout;

    @Value("${datasource.hikari.pool-name}")
    private String poolName;

    /* ==================================================================
       1. DataSource — HikariCP + Supabase Cloud PostgreSQL
       ================================================================== */
    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        config.setDriverClassName(driverClassName);
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);

        // Connection Pool 설정
        config.setMaximumPoolSize(maximumPoolSize);
        config.setMinimumIdle(minimumIdle);
        config.setIdleTimeout(idleTimeout);
        config.setMaxLifetime(maxLifetime);
        config.setConnectionTimeout(connectionTimeout);
        config.setPoolName(poolName);

        // Supabase PgBouncer 호환 설정
        // prepareThreshold=0 은 JDBC URL에서 설정 (PgBouncer prepared statement 비활성화)
        config.addDataSourceProperty("cachePrepStmts", "false");
        config.addDataSourceProperty("sslmode", "require");

        // Supabase PgBouncer 환경: 매 연결 시 search_path 강제 설정
        config.setConnectionInitSql("SET search_path TO asyoucost, public");

        // 연결 유효성 검사
        config.setConnectionTestQuery("SELECT 1");

        return new HikariDataSource(config);
    }

    /* ==================================================================
       2. SqlSessionFactory — MyBatis + PostgreSQL 방언 설정
       ================================================================== */
    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();

        // DataSource 연결
        factoryBean.setDataSource(dataSource);

        // MyBatis 전역 설정 (mybatis-config.xml)
        // - mapUnderscoreToCamelCase: true  (DB 컬럼 → Java 필드 자동 매핑)
        // - jdbcTypeForNull: OTHER          (PostgreSQL NULL 처리 방언)
        // - callSettersOnNulls: true        (NULL 값도 setter 호출)
        factoryBean.setConfigLocation(
                new ClassPathResource("config/mybatis-config.xml")
        );

        // Mapper XML 위치 (classpath:mapper/**/*.xml)
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        factoryBean.setMapperLocations(
                resolver.getResources("classpath:mapper/**/*.xml")
        );

        // Type Alias 패키지
        factoryBean.setTypeAliasesPackage("smartcost.app.bp");

        return factoryBean.getObject();
    }

    /* ==================================================================
       3. SqlSessionTemplate — Thread-Safe SqlSession
       ================================================================== */
    @Bean
    public SqlSessionTemplate sqlSession(SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    /* ==================================================================
       4. TransactionManager — @Transactional 지원
       ================================================================== */
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
