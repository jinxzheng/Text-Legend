import { timestampDefault } from '../time.js';

export async function up(knex) {
  await knex.schema.table('users', (t) => {
    t.boolean('is_admin').notNullable().defaultTo(false);
  });

  await knex.schema.createTable('mails', (t) => {
    t.increments('id').primary();
    t.integer('to_user_id').notNullable();
    t.string('from_name', 64).notNullable();
    t.string('title', 128).notNullable();
    t.text('body').notNullable();
    t.timestamp('created_at').defaultTo(timestampDefault(knex));
    t.timestamp('read_at').nullable();
  });

  await knex.schema.createTable('vip_codes', (t) => {
    t.increments('id').primary();
    t.string('code', 32).notNullable().unique();
    t.integer('used_by_user_id').nullable();
    t.timestamp('used_at').nullable();
    t.timestamp('created_at').defaultTo(timestampDefault(knex));
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('vip_codes');
  await knex.schema.dropTableIfExists('mails');
  await knex.schema.table('users', (t) => {
    t.dropColumn('is_admin');
  });
}
