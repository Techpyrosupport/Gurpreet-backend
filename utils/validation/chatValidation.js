const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require("./comonFilterValidation");

/** Validation keys and properties of the HistorySchema */
exports.schemaKeys = joi.object({
  prompt: joi.string().required(),
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  response: joi.string().allow(null).allow(''),
  sessionId: joi.string().required(),
  isActive: joi.boolean().default(true),
  isDeleted: joi.boolean().default(false),
}).unknown(true);

/** Validation keys and properties for updating HistorySchema documents */
exports.updateSchemaKeys = joi.object({
  prompt: joi.string().allow(null).allow(''),
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  response: joi.string().allow(null).allow(''),
  sessionId: joi.string().allow(null).allow(''),
  isActive: joi.boolean().allow(null),
  isDeleted: joi.boolean().allow(null),
  createdAt: joi.date().iso().allow(null),
  updatedAt: joi.date().iso().allow(null),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/),
}).unknown(true);

/** Validation keys and properties for filtering HistorySchema documents */
let keys = ['query', 'where'];
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      prompt: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      userId: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      response: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      sessionId: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      isActive: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      createdAt: joi.alternatives().try(joi.array().items(), joi.date(), joi.object()),
      updatedAt: joi.alternatives().try(joi.array().items(), joi.date(), joi.object()),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
    }).unknown(true)]),
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select,
}).unknown(true);
