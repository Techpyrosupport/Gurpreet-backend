
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

const quizSchema = new Schema(
  {
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    questions: [
      {
        questionText: {
          type: String
        },
        options: [
          {
            optionText: {
              type: String,
            },
          },
        ],
        credit: {
          type: Number,
        },
        correctOption: {
          type: Number,
        },
      },
    ],
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
    isDeleted: { type: Boolean,default:false },
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


quizSchema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  delete object.password;
  return object;
});

quizSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("quiz", quizSchema);
