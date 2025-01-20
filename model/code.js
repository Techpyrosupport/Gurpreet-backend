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
    inputs: {
      type: Map,
      of: String, 
    },
    lang: {
      type: String,
      enum: ["cpp", "python", "java", "javascript"]
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


schema.virtual("selectedInput").get(function () {
  return this.inputs?.get(this.lang) || "No code available for the selected language.";
});

// Modify the `toJSON` method for cleaner output
schema.method("toJSON", function () {
  const { _id, __v, inputs, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  object.selectedInput = this.selectedInput; 
  return object;
});

// Apply the pagination plugin
schema.plugin(mongoosePaginate);

// Create the model
const Code = mongoose.model("Code", schema);

module.exports = Code;
