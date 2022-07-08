"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 2000,
    equity: "0.1",
    company_handle: "c1",
  };

  test("create new job", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 2000,
        equity: "0.1",
        company_handle: "c1",
      },
    ]);
  });
});

/************************************** findAll */

describe("findAllJobs", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "job1",
        salary: 100,
        equity: "0.1",
        company_handle: "c1",
      },
      {
        title: "job2",
        salary: 200,
        equity: "0.2",
        company_handle: "c2",
      },
      {
        title: "job3",
        salary: 300,
        equity: "0.3",
        company_handle: "c2",
      },
    ]);
  });
});
