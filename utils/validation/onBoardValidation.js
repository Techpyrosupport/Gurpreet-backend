const joi = require('joi');
const {
  options, isCountOnly, populate, select,
} = require('./comonFilterValidation');

/** Validation keys and properties for the OnBoard schema */
exports.schemaKeys = joi.object({
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  courseId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  name: joi.string().required(),
  status:joi.string().allow(null).allow(''),
  email: joi.string().email().required(),
  phone: joi.string().pattern(/^\d{10}$/).required(), 
  technology: joi.string().required(),
  isActive: joi.boolean().default(true),
  isDeleted: joi.boolean().default(false),
  createdAt: joi.date().iso().allow(null),
  updatedAt: joi.date().iso().allow(null),
}).unknown(true);

/** Validation keys and properties for updating OnBoard schema documents */
exports.updateSchemaKeys = joi.object({
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  courseId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  name: joi.string().allow(null).allow(''),
  status:joi.string().allow(null).allow(''),
  email: joi.string().email().allow(null).allow(''),
  phone: joi.string().pattern(/^\d{10}$/).allow(null).allow(''),
  technology: joi.string().allow(null).allow(''),
  isActive: joi.boolean().allow(null),
  isDeleted: joi.boolean().allow(null),
  createdAt: joi.date().iso().allow(null),
  updatedAt: joi.date().iso().allow(null),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/),
}).unknown(true);

/** Validation keys and properties for filtering OnBoard schema documents */
let keys = ['query', 'where'];
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      userId: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      courseId: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      status: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      email: joi.alternatives().try(joi.array().items(), joi.string().email(), joi.object()),
      phone: joi.alternatives().try(joi.array().items(), joi.string().pattern(/^\d{10}$/), joi.object()),
      technology: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
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
