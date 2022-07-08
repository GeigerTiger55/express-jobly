"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * */

  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
      `INSERT INTO jobs(
          title,
          salary,
          equity,
          company_handle)
           VALUES
             ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle`,
      [
        title,
        salary,
        equity,
        company_handle
      ],
    );
    const job = result.rows[0];

    return job;
  }


  /** Find all jobs.
   * Accepts:
   * //TODO:
   * - optional filters object, each filter is also optional
   *  { minEmployees: [number], maxEmployees: [number], nameLike: [string]}
   *
   * Note: minEmployees must be less than maxEmployees
   *
   * Returns:
   *  [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

   static async findAll(filters = {}) {
    // const { minEmployees, maxEmployees, nameLike } = filters;

    // if (minEmployees > maxEmployees) {
    //   throw new BadRequestError("Min employees must be less than max employees");
    // }

    // const {whereQuery, filterValues} = this._sqlForFilters({
    //   minEmployees, maxEmployees, nameLike
    // });

    let queryString = `SELECT title,
        salary,
        equity,
        company_handle
      FROM jobs
      ORDER BY title`;

    const jobsRes = await db.query(queryString);
    return jobsRes.rows;
  }


}


module.exports = Job;
