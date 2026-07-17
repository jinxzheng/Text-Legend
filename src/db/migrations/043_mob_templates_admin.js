import { timestampDefault } from '../time.js';

export async function up(knex) {
  const hasTable = await knex.schema.hasTable('mob_templates');
  if (!hasTable) {
    await knex.schema.createTable('mob_templates', (t) => {
      t.string('template_id', 64).notNullable().primary();
      t.text('data_json').notNullable();
      t.timestamp('created_at').defaultTo(timestampDefault(knex));
      t.timestamp('updated_at').defaultTo(timestampDefault(knex));
    });

    await knex.schema.alterTable('mob_templates', (t) => {
      t.index('updated_at');
    });
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('mob_templates');
}
