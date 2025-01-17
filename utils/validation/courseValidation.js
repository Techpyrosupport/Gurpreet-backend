const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require("./comonFilterValidation");

/** Validation keys and properties of the course schema */
exports.schemaKeys = joi.object({
  name: joi.string().required(),
  description: joi.string().allow(null).allow(''),
  category: joi.string().allow(null).allow(''),
  subCategory: joi.string().allow(null).allow(''),
  price: joi.number().min(0).allow(null),
  discount: joi.number().min(0).allow(null),
  discountType: joi.string().valid('percentage', 'flat').allow(null),
  discountStartDate: joi.date().iso().allow(null),
  discountEndDate: joi.date().iso().allow(null),
  duration: joi.number().min(0).allow(null),
  durationType: joi.string().valid('hours', 'days', 'weeks', 'months').allow(null).allow(''),
  isPaid: joi.boolean(),
}).unknown(true);

/** Validation keys and properties for updating course documents */
exports.updateSchemaKeys = joi.object({
  name: joi.string().allow(null).allow(''),
  description: joi.string().allow(null).allow(''),
  category: joi.string().allow(null).allow(''),
  subCategory: joi.string().allow(null).allow(''),
  price: joi.number().min(0).allow(null),
  discount: joi.number().min(0).allow(null),
  discountType: joi.string().valid('percentage', 'flat').allow(null).allow(''),
  discountStartDate: joi.date().allow(null),
  discountEndDate: joi.date().allow(null),
  startDate: joi.date().allow(null),
  durationType: joi.string().valid('hours', 'days', 'weeks', 'months').allow(null).allow(''),
  isPaid: joi.boolean().allow(null),
  isPublished: joi.boolean().allow(null),
  isApproved: joi.boolean().allow(null),
  createdBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  isAppUser: joi.boolean().allow(null),
  isDeleted: joi.boolean().allow(null),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/),
}).unknown(true);

/** Validation keys and properties for filtering course documents */
let keys = ['query', 'where'];
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      category: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      subCategory: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      price: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      discount: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      discountType: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      isPaid: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isPublished: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isApproved: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
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
