-- Enterprise Platform Database Initialization
-- Create schemas for all services

-- Authentication Service Schema
CREATE SCHEMA IF NOT EXISTS auth;
COMMENT ON SCHEMA auth IS 'Authentication and user management';

-- Monitoring Service Schema  
CREATE SCHEMA IF NOT EXISTS monitoring;
COMMENT ON SCHEMA monitoring IS 'Task monitoring and anomaly detection';

-- Learning Service Schema
CREATE SCHEMA IF NOT EXISTS learning;
COMMENT ON SCHEMA learning IS 'AI learning and performance optimization';

-- Trading Service Schema
CREATE SCHEMA IF NOT EXISTS trading;
COMMENT ON SCHEMA trading IS 'High-frequency trading and market operations';

-- Market Signals Service Schema
CREATE SCHEMA IF NOT EXISTS market;
COMMENT ON SCHEMA market IS 'Market analysis and signal generation';

-- Banking Service Schema
CREATE SCHEMA IF NOT EXISTS banking;
COMMENT ON SCHEMA banking IS 'Banking and loan processing';

-- Healthcare Service Schema
CREATE SCHEMA IF NOT EXISTS healthcare;
COMMENT ON SCHEMA healthcare IS 'Healthcare data and HIPAA compliance';

-- Retail Service Schema
CREATE SCHEMA IF NOT EXISTS retail;
COMMENT ON SCHEMA retail IS 'Retail and e-commerce operations';

-- IoT Service Schema
CREATE SCHEMA IF NOT EXISTS iot;
COMMENT ON SCHEMA iot IS 'IoT device management and monitoring';

-- Main Platform Schema
CREATE SCHEMA IF NOT EXISTS platform;
COMMENT ON SCHEMA platform IS 'Main platform orchestration';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Grant permissions
GRANT USAGE ON SCHEMA auth TO enterprise_user;
GRANT USAGE ON SCHEMA monitoring TO enterprise_user;
GRANT USAGE ON SCHEMA learning TO enterprise_user;
GRANT USAGE ON SCHEMA trading TO enterprise_user;
GRANT USAGE ON SCHEMA market TO enterprise_user;
GRANT USAGE ON SCHEMA banking TO enterprise_user;
GRANT USAGE ON SCHEMA healthcare TO enterprise_user;
GRANT USAGE ON SCHEMA retail TO enterprise_user;
GRANT USAGE ON SCHEMA iot TO enterprise_user;
GRANT USAGE ON SCHEMA platform TO enterprise_user;

GRANT CREATE ON SCHEMA auth TO enterprise_user;
GRANT CREATE ON SCHEMA monitoring TO enterprise_user;
GRANT CREATE ON SCHEMA learning TO enterprise_user;
GRANT CREATE ON SCHEMA trading TO enterprise_user;
GRANT CREATE ON SCHEMA market TO enterprise_user;
GRANT CREATE ON SCHEMA banking TO enterprise_user;
GRANT CREATE ON SCHEMA healthcare TO enterprise_user;
GRANT CREATE ON SCHEMA retail TO enterprise_user;
GRANT CREATE ON SCHEMA iot TO enterprise_user;
GRANT CREATE ON SCHEMA platform TO enterprise_user;
