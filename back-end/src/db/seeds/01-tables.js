const tablesData = require('./01-tables.json');

exports.seed = async function (knex) {
  await knex('tables').del();
  return knex('tables').insert(tablesData);
};