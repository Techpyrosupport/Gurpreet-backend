/**
 * codeValidation.js
 * @description :: Validate each POST, PUT, and filter request as per the Code model.
 */

const joi = require("joi");
const { options, isCountOnly, populate, select } = require("./comonFilterValidation");

/** Validation keys and properties for the Code model */
exports.schemaKeys = joi
  .object({
    inputs: joi
      .object()
      .pattern(joi.string().valid("cpp", "python", "java", "javascript"), joi.string())
      .required(),
    lang: joi.string().valid("cpp", "python", "java", "javascript"),
      userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    isActive: joi.boolean(),
    isDeleted: joi.boolean(),
    createdBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
  })
  .unknown(true);

/** Validation keys and properties of the Code model for updating */
exports.updateSchemaKeys = joi
  .object({
    inputs: joi
      .object()
      .pattern(joi.string().valid("cpp", "python", "java", "javascript"), joi.string())
      .allow(null),
      userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    lang: joi.string().valid("cpp", "python", "java", "javascript").allow(null),
    isActive: joi.boolean(),
    isDeleted: joi.boolean(),
    createdBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  })
  .unknown(true);

/** Validation keys and properties for filtering documents */
let keys = ["query", "where"];
exports.findFilterKeys = joi
  .object({
    options: options,
    ...Object.fromEntries(
      keys.map((key) => [
        key,
        joi
          .object({
            lang: joi.alternatives().try(
              joi.array().items(joi.string().valid("cpp", "python", "java", "javascript")),
              joi.string().valid("cpp", "python", "java", "javascript"),
              joi.object()
            ),
            isActive: joi.alternatives().try(
              joi.array().items(joi.boolean()),
              joi.boolean(),
              joi.object()
            ),
            isDeleted: joi.alternatives().try(
              joi.array().items(joi.boolean()),
              joi.boolean(),
              joi.object()
            ),
            
            createdBy: joi.alternatives().try(
              joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
              joi.string().regex(/^[0-9a-fA-F]{24}$/),
              joi.object()
            ),
            userId: joi.alternatives().try(
              joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
              joi.string().regex(/^[0-9a-fA-F]{24}$/),
              joi.object()
            ),
            updatedBy: joi.alternatives().try(
              joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
              joi.string().regex(/^[0-9a-fA-F]{24}$/),
              joi.object()
            ),
            id: joi.any(),
            _id: joi.alternatives().try(
              joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
              joi.string().regex(/^[0-9a-fA-F]{24}$/),
              joi.object()
            ),
          })
          .unknown(true),
      ])
    ),
    isCountOnly: isCountOnly,
    populate: joi.array().items(populate),
    select: select,
  })
  .unknown(true);
