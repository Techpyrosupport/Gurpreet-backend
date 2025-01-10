/**
 * quizValidation.js
 * @description :: Validate each POST, PUT, and filter request as per the Quiz model.
 */

const joi = require("joi");
const { options, isCountOnly, populate, select } = require("./comonFilterValidation");

/** Validation keys and properties of the quiz */
exports.schemaKeys = joi
  .object({
    title: joi.string().allow(null).allow(""),
    description: joi.string().allow(null).allow(""),
    order: joi.number().integer().min(0),
    questions: joi
      .array()
      .items(
        joi.object({
          questionText: joi.string().required(),
          options: joi
            .array()
            .items(
              joi.object({
                optionText: joi.string().allow(""),
              })
            )
            .required(),
          credit: joi.number().integer().min(0),
          correctOption: joi.number().integer().min(0),
        })
      )
      .required(),
    createdBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    isActive: joi.boolean(),
    isDeleted: joi.boolean(),
  })
  .unknown(true);

/** Validation keys and properties of the quiz for updating */
exports.updateSchemaKeys = joi
  .object({
    title: joi.string().allow(null).allow(""),
    description: joi.string().allow(null).allow(""),
    order: joi.number().integer().min(0),
    questions: joi
      .array()
      .items(
        joi.object({
          questionText: joi.string().required(),
          options: joi
            .array()
            .items(
              joi.object({
                optionText: joi.string().allow(""),
              })
            )
            .required(),
          credit: joi.number().integer().min(0),
          correctOption: joi.number().integer().min(0),
        })
      )
      .allow(null),
    createdBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    isActive: joi.boolean(),
    isDeleted: joi.boolean(),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  })
  .unknown(true);

/** Validation keys and properties of the quiz for filtering documents */
let keys = ["query", "where"];
exports.findFilterKeys = joi
  .object({
    options: options,
    ...Object.fromEntries(
      keys.map((key) => [
        key,
        joi
          .object({
            title: joi.alternatives().try(
              joi.array().items(joi.string()),
              joi.string(),
              joi.object()
            ),
            description: joi.alternatives().try(
              joi.array().items(joi.string()),
              joi.string(),
              joi.object()
            ),
            order: joi.alternatives().try(
              joi.array().items(joi.number().integer()),
              joi.number().integer(),
              joi.object()
            ),
            createdBy: joi.alternatives().try(
              joi.array().items(
                joi.string().regex(/^[0-9a-fA-F]{24}$/)
              ),
              joi.string().regex(/^[0-9a-fA-F]{24}$/),
              joi.object()
            ),
            updatedBy: joi.alternatives().try(
              joi.array().items(
                joi.string().regex(/^[0-9a-fA-F]{24}$/)
              ),
              joi.string().regex(/^[0-9a-fA-F]{24}$/),
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
            id: joi.any(),
            _id: joi.alternatives().try(
              joi.array().items(
                joi.string().regex(/^[0-9a-fA-F]{24}$/)
              ),
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
