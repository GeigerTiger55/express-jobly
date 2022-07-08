"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds,
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

/************************************** get */

describe("get", function () {
  test("works", async function () {
    console.log('*****get works test', jobIds[0]);
    let job = await Job.get(jobIds[0]);
    expect(job).toEqual({
      title: "job1",
      salary: 100,
      equity: "0.1",
      company_handle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get("1");
      throw new Error("failed not found test");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New Job2",
    salary: 500,
    equity: "0.02",
  };

  test("works", async function () {
    let job = await Job.update(jobIds[1], updateData);
    expect(job).toEqual({
      company_handle: "c2",
      ...updateData,
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = '${jobIds[1]}'`);
    expect(result.rows).toEqual([{
      title: "New Job2",
      salary: 500,
      equity: "0.02",
      company_handle: "c2",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New Job2 Again",
      salary: null,
      equity: null,
    };

    let job = await Job.update(jobIds[1], updateDataSetNulls);
    expect(job).toEqual({
      company_handle: "c2",
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = '${jobIds[1]}'`);
    expect(result.rows).toEqual([{
      title: "New Job2 Again",
      salary: null,
      equity: null,
      company_handle: "c2",
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update("1", updateData);
      throw new Error('not found test failed');
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(jobIds[1], {});
      throw new Error('no data test failed');
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  /************************************** remove */

  describe("remove", function () {
    test("works", async function () {
      await Job.remove(jobIds[2]);
      const res = await db.query(
        `SELECT id FROM jobs WHERE id=${jobIds[2]}`);
      expect(res.rows.length).toEqual(0);
    });

    test("not found if no such job", async function () {
      try {
        await Job.remove("1");
        throw new Error("not found if no such job")
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });

});