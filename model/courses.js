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
    description: { type: String },
    category: { type: String },
    image:{type:String},
    subCategory: { type: String },
    price: { type: Number },
    discount: { type: Number },
    discountStartDate: { type: Date },
    discountEndDate: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date },
    duration: { type: Number },
    durationType: { type: String },
    durationUnit: { type: String },
    isPaid: { type: Boolean },
    isPublished: { type: Boolean },
    isApproved: { type: Boolean },
  
    createdBy: {
      ref: "user",
      type: Schema.Types.ObjectId,
      validate: {
        validator: async function (value) {
          const id = await mongoose.model("user").findById(value);
          return !!id;
        },
        message: "user does not exist.",
      },
    },
    updatedBy: {
      ref: "user",
      type: Schema.Types.ObjectId,
      validate: {
        validator: async function (value) {
          const id = await mongoose.model("user").findById(value);
          return !!id;
        },
        message: "user does not exist.",
      },
    },
    isAppUser: { type: Boolean, default: true },
    isDeleted: { type: Boolean },
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
const Course = mongoose.model("course", schema);

module.exports = Course;
