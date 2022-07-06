"use strict";
const { BadRequestError } = require("../expressError");

const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works", function () {
    const dataToUpdate = {lastName: "lastName", email: "email@gmail.com"};
    const jsToSql = {lastName: "last_name"};
    let result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(result).toEqual({
      setCols: `"last_name"=$1, "email"=$2`,
      values: ["lastName", "email@gmail.com"]
    });
  });

  test("throws error if no data to update", function () {
    try {
      const dataToUpdate = {};
      const jsToSql = {lastName: "last_name"};
      let result = sqlForPartialUpdate(dataToUpdate, jsToSql);
      // TODO:
      throw new Error(`Didn't throw error no data passed in,
      this test failed`)
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
    }
  });

  test("doesn't throw an error if no jsToSql arg", function () {
    const dataToUpdate = {last_name: "lastName"};
    let result = sqlForPartialUpdate(dataToUpdate);
    expect(result).toEqual({
      setCols: `"last_name"=$1`,
      values: ["lastName"]
    });
  });

  test("works with empty strings and null values", function () {
    const dataToUpdate = {lastName: "", email: null};
    const jsToSql = {lastName: "last_name"};
    let result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(result).toEqual({
      setCols: `"last_name"=$1, "email"=$2`,
      values: ["", null]
    });
  });

});

