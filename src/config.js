const port = Number(process.env.PORT || 3000);
const dbClient = process.env.DB_CLIENT || 'sqlite';

const config = {
  port,
  db: {
    client: dbClient,
    filename: process.env.DB_FILENAME || './data/game.sqlite',
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'legend',
    poolMax: Number(process.env.DB_POOL_MAX || (dbClient === 'sqlite' ? 4 : 30)),
    sqlite: {
      wal: process.env.SQLITE_WAL !== 'false',
      synchronous: process.env.SQLITE_SYNCHRONOUS || 'NORMAL'
    },
    slowQueryLog: process.env.DB_SLOW_QUERY_LOG !== 'false',
    slowQueryMs: Number(
      process.env.DB_SLOW_QUERY_MS
      || (dbClient === 'sqlite' ? 500 : 200)
    )
  },
  sessionTtlMin: Number(process.env.SESSION_TTL_MIN || 120),
  consignmentHistoryRetentionDays: Math.max(1, Number(process.env.CONSIGNMENT_HISTORY_RETENTION_DAYS || 90)),
  publicBaseUrl: String(process.env.PUBLIC_BASE_URL || process.env.APP_BASE_URL || '').trim(),
  alipay: {
    enabled: process.env.ALIPAY_ENABLED === 'true',
    appId: String(process.env.ALIPAY_APP_ID || '').trim(),
    gateway: String(process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do').trim(),
    privateKey: String(process.env.ALIPAY_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim(),
    publicKey: String(process.env.ALIPAY_PUBLIC_KEY || '').replace(/\\n/g, '\n').trim(),
    notifyUrl: String(process.env.ALIPAY_NOTIFY_URL || '').trim(),
    yuanbaoPerYuan: Math.max(1, Math.floor(Number(process.env.ALIPAY_YUANBAO_PER_YUAN || 100) || 100)),
    minAmountYuan: Math.max(0.01, Number(process.env.ALIPAY_MIN_AMOUNT_YUAN || 1)),
    maxAmountYuan: Math.max(0.01, Number(process.env.ALIPAY_MAX_AMOUNT_YUAN || 5000))
  },
  requestLogAll: process.env.REQUEST_LOG_ALL === 'true',
  requestLogSlowMs: Math.max(0, Number(process.env.REQUEST_LOG_SLOW_MS || 1500)),
  adminPath: process.env.ADMIN_PATH || 'admin',
  adminBootstrapSecret: process.env.ADMIN_BOOTSTRAP_SECRET || '',
  adminBootstrapUser: process.env.ADMIN_BOOTSTRAP_USER || ''
};

export default config;
