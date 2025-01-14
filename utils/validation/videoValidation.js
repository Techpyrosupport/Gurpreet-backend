const joi = require("joi");
const { options, isCountOnly, populate, select } = require("./comonFilterValidation");

/** Validation keys and properties of the Video schema */
exports.schemaKeys = joi
  .object({
    title: joi.string().allow(null).allow(""),
    description: joi.string().allow(null).allow(""),
    videoUrl: joi.string().uri().required(),
    thumbnailUrl: joi.string().uri().allow(null).allow(""),
    views: joi.number().integer().min(0),
    likes: joi.number().integer().min(0),
    dislikes: joi.number().integer().min(0),
    tags: joi.array().items(joi.string()).allow(null),
    createdBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    isActive: joi.boolean(),
    isDeleted: joi.boolean(),
  })
  .unknown(true);

/** Validation keys and properties of the Video schema for updating */
exports.updateSchemaKeys = joi
  .object({
    title: joi.string().allow(null).allow(""),
    description: joi.string().allow(null).allow(""),
    videoUrl: joi.string().uri().allow(null).allow(""),
    thumbnailUrl: joi.string().uri().allow(null).allow(""),
    views: joi.number().integer().min(0).allow(null),
    likes: joi.number().integer().min(0).allow(null),
    dislikes: joi.number().integer().min(0).allow(null),
    tags: joi.array().items(joi.string()).allow(null),
    createdBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    isActive: joi.boolean(),
    isDeleted: joi.boolean(),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  })
  .unknown(true);

/** Validation keys and properties of the Video schema for filtering documents */
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
            videoUrl: joi.alternatives().try(
              joi.array().items(joi.string().uri()),
              joi.string().uri(),
              joi.object()
            ),
            thumbnailUrl: joi.alternatives().try(
              joi.array().items(joi.string().uri()),
              joi.string().uri(),
              joi.object()
            ),
            views: joi.alternatives().try(
              joi.array().items(joi.number().integer().min(0)),
              joi.number().integer().min(0),
              joi.object()
            ),
            likes: joi.alternatives().try(
              joi.array().items(joi.number().integer().min(0)),
              joi.number().integer().min(0),
              joi.object()
            ),
            dislikes: joi.alternatives().try(
              joi.array().items(joi.number().integer().min(0)),
              joi.number().integer().min(0),
              joi.object()
            ),
            tags: joi.alternatives().try(
              joi.array().items(joi.string()),
              joi.string(),
              joi.object()
            ),
            createdBy: joi.alternatives().try(
              joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
              joi.string().regex(/^[0-9a-fA-F]{24}$/),
              joi.object()
            ),
            updatedBy: joi.alternatives().try(
              joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
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
