export async function up(knex) {
  await knex.schema.createTable('alipay_recharge_orders', (t) => {
    t.increments('id').primary();
    t.string('out_trade_no', 64).notNullable().unique();
    t.integer('user_id').notNullable();
    t.integer('realm_id').notNullable().defaultTo(1);
    t.string('char_name', 64).notNullable();
    t.integer('yuanbao').notNullable();
    t.decimal('amount_yuan', 12, 2).notNullable();
    t.string('status', 24).notNullable().defaultTo('created');
    t.string('trade_no', 64).nullable();
    t.text('qr_code').nullable();
    t.text('buyer_logon_id').nullable();
    t.text('notify_payload_json').nullable();
    t.timestamp('paid_at').nullable();
    t.timestamp('credited_at').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.index(['user_id', 'created_at']);
    t.index(['status', 'created_at']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('alipay_recharge_orders');
}
