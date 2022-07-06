"use strict";
const { BadRequestError } = require("../expressError");

/** Creates sql script to map fields that are being updated to their new values.
 * 
 * Accepts:
 * - "dataToUpdate" is a key to value object of database fields (in JavaScript 
 * syntax) and the new replacement values:
 *  EX: { lastName: "NewLastName", email: "newemail@g.com" }
 * 
 * - "jsToSql" is an object containing keys in JavaScript syntax mapped to values
 * for the corresponding fields in the table. Only contains keys/fields with names
 * differing between the JavaScript and table.
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

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
