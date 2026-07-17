import { timestampDefault } from '../time.js';

export async function up(knex) {
  await knex.schema.createTable('sponsors', (t) => {
    t.increments('id').primary();
    t.string('player_name', 64).notNullable();
    t.integer('amount').notNullable().defaultTo(0);
    t.timestamp('created_at').defaultTo(timestampDefault(knex));
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('sponsors');
}
