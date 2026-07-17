function dbClientName(knex) {
  return String(knex?.client?.config?.client || '').toLowerCase();
}

export function isSqliteClient(knex) {
  return dbClientName(knex).includes('sqlite');
}

export function dbNow(knex) {
  return isSqliteClient(knex)
    ? knex.raw("datetime('now', 'localtime')")
    : knex.fn.now();
}

export function timestampDefault(knex) {
  return isSqliteClient(knex)
    ? knex.raw("(datetime('now', 'localtime'))")
    : knex.fn.now();
}
