const joi = require('joi');
const {
  options,
  isCountOnly,
  populate,
  select
} = require('./comonFilterValidation');

/** Validation keys and properties of the Topic schema */
exports.schemaKeys = joi.object({
  name: joi.string().required(),
  description: joi.string().required(),
  courseId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  serialKey: joi.number().integer().required(),
  videos: joi.array().items(
    joi.object({
      videoId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
      quizId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
      codeId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
      order: joi.string().valid("video", "quiz").default("video"),
      serialNo: joi.number().integer().required()
    })
  ),
  createdBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  isActive: joi.boolean().default(true),
  isDeleted: joi.boolean().allow(null),
  createdAt: joi.date().iso().allow(null),
  updatedAt: joi.date().iso().allow(null)
}).unknown(true);

/** Validation keys and properties for updating Topic documents */
exports.updateSchemaKeys = joi.object({
  name: joi.string().allow(null).allow(''),
  description: joi.string().allow(null).allow(''),
  courseId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  serialKey: joi.number().integer().allow(null),
  videos: joi.array().items(
    joi.object({
      videoId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
      quizId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
      codeId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
      order: joi.string().valid("video", "quiz").allow(null),
      serialNo: joi.number().integer().allow(null)
    })
  ).allow(null),
  createdBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  isActive: joi.boolean().allow(null),
  isDeleted: joi.boolean().allow(null),
  createdAt: joi.date().iso().allow(null),
  updatedAt: joi.date().iso().allow(null),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null)
}).unknown(true);

/** Validation keys and properties for filtering Topic documents */
let keys = ['query', 'where'];
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      description: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      courseId: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      serialKey: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      isActive: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      createdBy: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      updatedBy: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
    }).unknown(true)])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select
}).unknown(true);
