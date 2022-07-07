"use strict";
const { BadRequestError } = require("../expressError");

/** Creates sql script to map fields that are being updated to their new values.
 *
 * Accepts:
 * - "dataToUpdate" is a key value object of database fields (in JavaScript
 * syntax) and the new replacement values:
 *  EX: { lastName: "NewLastName", email: "newemail@g.com" }
 *
 * - "jsToSql" is an object containing keys in JavaScript syntax mapped to
 * values for the corresponding fields in the table. Only contains keys/fields
 * with names differing between the JavaScript and table.
 *  EX: { lastName: last_name }
 *
 * Returns object containing:
 * - "setCols": sql script of columns mapped to values array indexes (does not
 * include columns that are not being updated):
 *  EX: "last_name=$1, email=$2"
 *
 * - "values": array of the new values in order of the columns being updated
 *  EX: [ "NewLastName", "newemail@g.com" ]
 *
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");
  if (!jsToSql) {
    jsToSql = {};
  }
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


function sqlForFilters(filters) {
  let whereQuery = " WHERE ";

  let filterValues = [];
  let index = 1;

  const { minEmployees, maxEmployees, nameLike } = filters;

  if ((minEmployees && maxEmployees) && minEmployees > maxEmployees) {
    throw new BadRequestError("Min employees must be less than max employees");
    // TODO: check if min/max employees not equal to zero
  }

  let whereArgs = [];
  // TODO: take numbers off
  // check typeof min & max and throw error if not nums
  if (Number(minEmployees)) {
    whereArgs.push(`num_employees >= $${index}`);
    filterValues.push(minEmployees);
    index += 1;
    // if not zero similiar prob to above
  } else if (minEmployees) {
    throw new BadRequestError("Min employees needs to be a number.");
  }
  if (Number(maxEmployees)) {
    whereArgs.push(`num_employees <= $${index}`);
    filterValues.push(maxEmployees);
    index += 1;
  } else if (maxEmployees) {
    throw new BadRequestError("Max employees needs to be a number.");
  }
  if (nameLike) {
    whereArgs.push(`name ILIKE $${index}`);
    filterValues.push(`%${nameLike}%`);
    index += 1;
  }
  whereQuery += whereArgs.join(' AND ');



}




module.exports = { sqlForPartialUpdate, sqlForFilters };

