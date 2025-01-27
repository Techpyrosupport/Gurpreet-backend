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

const codeResponseSchema = new Schema(
  {
    codeId: {
      type: Schema.Types.ObjectId,
      ref: "Code",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    creditsEarned: {
      type: Boolean,
      default: false, 
    },
    lang: {
        type: String,
        enum: ["cpp", "python", "java", "javascript"]
      },
    inputs: {
      type: Map,
      of: String,
    },
    createdBy: {
      ref: "user",
      type: Schema.Types.ObjectId,
      validate: {
        validator: async function (value) {
          const id = await mongoose.model("user").findById(value);
          return !!id;
        },
        message: "User does not exist.",
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
        message: "User does not exist.",
      },
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
   
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



codeResponseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("coderesponse", codeResponseSchema);
