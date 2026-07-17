import { timestampDefault } from '../time.js';

export async function up(knex) {
  const client = String(knex?.client?.config?.client || '').toLowerCase();
  if (!client.includes('sqlite')) return;
  if (!(await knex.schema.hasTable('sessions'))) return;

  const row = await knex('sqlite_master')
    .select('sql')
    .where({ type: 'table', name: 'sessions' })
    .first();
  if (!String(row?.sql || '').includes('CURRENT_TIMESTAMP')) return;

  await knex.transaction(async (trx) => {
    await trx.schema.createTable('sessions_localtime_new', (t) => {
      t.increments('id').primary();
      t.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE');
      t.string('token', 64).notNullable().unique();
      t.timestamp('created_at').defaultTo(timestampDefault(trx));
      t.timestamp('last_seen').defaultTo(timestampDefault(trx));
    });

    await trx.raw(`
      INSERT INTO sessions_localtime_new (id, user_id, token, created_at, last_seen)
      SELECT
        id,
        user_id,
        token,
        COALESCE(datetime(created_at, 'localtime'), datetime('now', 'localtime')),
        COALESCE(datetime(last_seen, 'localtime'), datetime('now', 'localtime'))
      FROM sessions
    `);

    await trx.schema.dropTable('sessions');
    await trx.schema.renameTable('sessions_localtime_new', 'sessions');
  });
}

export async function down() {}
