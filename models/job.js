"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

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
   *  [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll(filters = {}) {
    //TODO: update filter function
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

  /** Given a job id, return data about job.
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    console.log('****Job.get', id);
    const jobRes = await db.query(
      `SELECT title,
            salary,
            equity,
            company_handle
           FROM jobs
           WHERE id = $1`,
      [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   */

   static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data);
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING title, salary, equity, company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

   static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }

}


module.exports = Job;
