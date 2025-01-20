const joi = require('joi');
const {
  options, isCountOnly, populate, select,
} = require('./comonFilterValidation');

/** Validation keys and properties for the Payment schema */
exports.schemaKeys = joi.object({
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  refId: joi.string().allow(null).allow(''),
  paymentChannel: joi.string().allow(null).allow(''),
  currentPayment: joi.number().required(),
  totalPayment: joi.number().required(),
  order_id: joi.string().required(),
  payment_id: joi.string().allow(null).allow(''),
  status: joi.string().valid('pending', 'success', 'failed', 'refunded', 'partial').default('pending'),
  addedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  isAppUser: joi.boolean().default(true),
  isActive: joi.boolean().default(true),
  isDeleted: joi.boolean().default(false),
  createdAt: joi.date().iso().allow(null),
  updatedAt: joi.date().iso().allow(null),
}).unknown(true);

/** Validation keys and properties for updating Payment schema documents */
exports.updateSchemaKeys = joi.object({
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  refId: joi.string().allow(null).allow(''),
  paymentChannel: joi.string().allow(null).allow(''),
  currentPayment: joi.number().allow(null),
  totalPayment: joi.number().allow(null),
  order_id: joi.string().allow(null).allow(''),
  payment_id: joi.string().allow(null).allow(''),
  status: joi.string().valid('pending', 'success', 'failed', 'refunded', 'partial').allow(null),
  addedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  isAppUser: joi.boolean().allow(null),
  isActive: joi.boolean().allow(null),
  isDeleted: joi.boolean().allow(null),
  createdAt: joi.date().iso().allow(null),
  updatedAt: joi.date().iso().allow(null),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
}).unknown(true);

/** Validation keys and properties for filtering Payment schema documents */
let keys = ['query', 'where'];
exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      userId: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      refId: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      paymentChannel: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      currentPayment: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      totalPayment: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      order_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      payment_id: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      status: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      addedBy: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      updatedBy: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      isAppUser: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
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
