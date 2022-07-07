"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    companyNewSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.create(req.body);
  return res.status(201).json({ company });
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 *
 * Can filter on below search filters which are passed in the query string:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Ignores any other params contained in the query string
 *
 * Authorization required: none
 *
 * Checks if valid filters and throws an error if invalid filters exist
 *
 * Throws an error if minEmployees or maxEmployees are not numbers
 */

router.get("/", async function (req, res, next) {
  const { nameLike, minEmployees, maxEmployees, ...invalidFilters } = req.query;

  if (Object.keys(invalidFilters).length > 0) {
    throw new BadRequestError("Invalid filters given.");
  }

  let filters = {};

  if (nameLike) {
    filters.nameLike = nameLike;
  }

  if (Number(minEmployees)) {
    filters.minEmployees = Number(minEmployees);
  } else if (minEmployees) {
    throw new BadRequestError("Min employees needs to be a number.");
  }

  if (Number(maxEmployees)) {
    filters.maxEmployees = Number(maxEmployees);
  } else if (maxEmployees) {
    throw new BadRequestError("Max employees needs to be a number.");
  }

  if ((Number(maxEmployees) && Number(minEmployees))
    && Number(maxEmployees) < Number(minEmployees)) {
    throw new BadRequestError("Min employees is greater than max employees.");
  }


  let companies;

  if (Object.keys(filters).length > 0) {
    companies = await Company.findAll(filters);
  } else {
    companies = await Company.findAll();
  }
  return res.json({ companies });
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  const company = await Company.get(req.params.handle);
  return res.json({ company });
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureLoggedIn, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    companyUpdateSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.update(req.params.handle, req.body);
  return res.json({ company });
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
  await Company.remove(req.params.handle);
  return res.json({ deleted: req.params.handle });
});


module.exports = router;
