const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

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
    IdentificationNumber: {type: String},
    shopOwner: String,
    shopName: String,
    shopDescription: String,
    shopLogo: String,
    shopEmail: String,
    shopPhone: String,
    url: String,
    coords:{
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number]
      }
    },
    shopAddress:{
      locality : {type:String},
      city : {type:String},
      state : {type:String},
      country : {type:String},
      zipcode : {type:Number}
   },
   Shop_overall_rating: {type:String},
   Shop_ranking: {type:Number},
   Product_price: {type:String},
   Shop_overall_feedback: {type:String},
   Shop_employee_feedback: {type:String},
   Price_feedback: {type:String},
   col1: {type:String},

    isDeleted: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    
},
      {
        timestamps: {
          createdAt: 'createdAt',
          updatedAt: 'updatedAt',
          commentCreatedAt: 'commentCreatedAt'
        }
      }

  );


  schema.pre('save', async function (next) {
    this.isDeleted = false;
    next();
  });
  
  schema.pre('insertMany', async function (next, docs) {
    if (docs && docs.length){
      for (let index = 0; index < docs.length; index++) {
        const element = docs[index];
        element.isDeleted = false;
      }
    }
    next();
  });
  
  schema.method('toJSON', function () {
    const {
      _id, __v, ...object 
    } = this.toObject({ virtuals:true });
    object.id = _id;
       
    return object;
  });
  schema.plugin(mongoosePaginate);
  const shop = mongoose.model('shop',schema);
  module.exports = shop;