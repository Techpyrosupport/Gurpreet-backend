const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const bcrypt = require("bcrypt");
const {USER_TYPES} = require("../constants/authConstant");
const {convertObjectToEnum} = require("../utils/comon")

const myCustomLabels = {
    totalDocs: 'itemCount',
    docs: 'data',
    limit: 'perPage',
    page: 'currentPage',
    nextPage: 'next',
    prevPage: 'prev',
    totalPages: 'pageCount',
    pagingCounter: 'slNo',
    meta: 'paginator',
  };
 
  mongoosePaginate.paginate.options = {customLabels:myCustomLabels}
  const Schema = mongoose.Schema;

  const schema = new Schema({
      password: {
        type: String,
      },
      name:{type:String},
      email: {
        type: String,
      },
      phone: {
          type: Number,
        },
        bio:{type:String},
        followers:[{ref: 'user',
      type: Schema.Types.ObjectId,
      validate: {
        validator: async function(value) {
           const id = await mongoose.model('user').findById(value);
           return !!id;
        },
        message: 'user does not exist.'
     }}],
      following:[{ref: 'user',
      type: Schema.Types.ObjectId,
      validate: {
        validator: async function(value) {
           const id = await mongoose.model('user').findById(value);
           return !!id;
        },
        message: 'user does not exist.'
     }}],
      userType: {
        type: Number,
        enum: convertObjectToEnum(USER_TYPES),
        required: true
      },
      country_code:{
        type: Number,
        default:91
       } ,
      address:[{
        locality : {type:String},
        city : {type:String},
        state : {type:String},
        country : {type:String},
        zipcode : {type:Number}
     }],
     registeredLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number]
      }
    },
      picture: {
        type: String
      },
        loginRetryLimit: {
          type: Number,
          default: 0
        },
        loginReactiveTime: { type: Date },
      createdBy: {
        ref: 'user',
        type: Schema.Types.ObjectId,
        validate: {
          validator: async function(value) {
             const id = await mongoose.model('user').findById(value);
             return !!id;
          },
          message: 'user does not exist.'
       }
      },
      updatedBy: {
        ref: 'user',
        type: Schema.Types.ObjectId,
        validate: {
          validator: async function(value) {
             const id = await mongoose.model('user').findById(value);
             return !!id;
          },
          message: 'user does not exist.'
       }
      },
      isAppUser: { type: Boolean, default: true },
      isDeleted: { type: Boolean },
      createdAt: { type: Date },
      updatedAt: { type: Date },
    },
      {
        timestamps: {
          createdAt: 'createdAt',
          updatedAt: 'updatedAt'
        }
      }

  );

  schema.pre('save', async function (next) {
    this.isDeleted = false;
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 8);
    }
    next();
  });

  schema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return bcrypt.compare(password, user.password);
  };

  schema.method('toJSON', function () {
    const {
      _id, __v, ...object
    } = this.toObject({ virtuals: true });
    object.id = _id;
    delete object.password;
    return object;
  });

schema.plugin(mongoosePaginate);
const user = mongoose.model('user', schema);

module.exports = user;