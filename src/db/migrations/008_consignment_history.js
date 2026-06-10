import { timestampDefault } from '../time.js';

export async function up(knex) {
  const hasTable = await knex.schema.hasTable('consignment_history');
  if (hasTable) return;
  await knex.schema.createTable('consignment_history', (t) => {
    t.increments('id').primary();
    t.string('seller_name').notNullable();
    t.string('buyer_name').notNullable();
    t.string('item_id').notNullable();
    t.integer('qty').notNullable();
    t.integer('price').notNullable();
    t.text('effects_json');
    t.timestamp('sold_at').defaultTo(timestampDefault(knex));
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('consignment_history');
}
