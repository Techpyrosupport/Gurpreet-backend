const joi = require('joi');
const {
  options, isCountOnly, populate, select,
} = require('./comonFilterValidation')

/** Validation keys and properties of the Contact schema */
exports.schemaKeys = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  phone: joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(),
  topic: joi.string().required(),
  message: joi.string().required(),
  profession: joi.string().allow(null).allow(''),
  isAppUser: joi.boolean(),
  isDeleted: joi.boolean().allow(null),
}).unknown(true);

/** Validation keys and properties for updating Contact documents */
exports.updateSchemaKeys = joi.object({
  name: joi.string().allow(null).allow(''),
  email: joi.string().email().allow(null),
  phone: joi.string().pattern(/^[0-9]+$/).min(10).max(15).allow(null),
  topic: joi.string().allow(null).allow(''),
  message: joi.string().allow(null).allow(''),
  profession: joi.string().allow(null).allow(''),
  isAppUser: joi.boolean().allow(null),
  isDeleted: joi.boolean().allow(null),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/),
}).unknown(true);

/** Validation keys and properties for filtering Contact documents */
let keys = ['query', 'where'];
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      email: joi.alternatives().try(joi.array().items(), joi.string().email(), joi.object()),
      phone: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      topic: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      message: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      profession: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      isAppUser: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()), 
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
    }).unknown(true)]),
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select,
}).unknown(true);
