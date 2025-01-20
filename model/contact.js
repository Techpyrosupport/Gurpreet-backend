const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const myCustomLabels = {
  totalDocs: "itemCount",
  docs: "data",
  limit: "perPage",
  page: "currentPage",
  nextPage: "next",
  prevPage: "prev",
  totalPages: "pageCount",
  pagingCounter: "slNo",
  meta: "paginator",
};

mongoosePaginate.paginate.options = { customLabels: myCustomLabels };
const Schema = mongoose.Schema;

const schema = new Schema(
  {
name: { type: String },
email: { type: String },
phone: { type: String },
topic:{
    type:String
},
message:{
    type:String
},
profession:{
    type:String
},

  
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean,default:false},
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);



schema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  delete object.password;
  return object;
});

schema.plugin(mongoosePaginate);
const Contact = mongoose.model("contact", schema);

module.exports = Contact;
