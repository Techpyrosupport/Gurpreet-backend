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
   userId:{
    type: Schema.Types.ObjectId,
    ref: 'user',
    
   },
   courseId:{
    type: Schema.Types.ObjectId,
    ref: 'course',
    required: true
   },
   status: { type: String, enum: ['success','pending','cancel','failed','active'] , default: 'pending'},
   name:{
    type:String,
   },
   email:{
    type:String,
   },
   phone:{
    type:String,
   },
   technology:{
    type:String,
   },

   isActive:{type:Boolean,default:true},
      isDeleted: { type: Boolean,default:false},
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
    this.isActive = true;
    next();
  });
  
  schema.pre('insertMany', async function (next, docs) {
    if (docs && docs.length){
      for (let index = 0; index < docs.length; index++) {
        const element = docs[index];
        element.isDeleted = false;
        element.isActive = true;
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

  const OnBoard = mongoose.model('onboard',schema);
  module.exports = OnBoard;