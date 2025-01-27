
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

const quizResponseSchema = new Schema(
  {
   quizId:{
    type: Schema.Types.ObjectId,
    ref: 'quiz',
   },
   userId:{
    type: Schema.Types.ObjectId,
    ref: 'user',
   },
   questions:[
    {
        questionId:{
            type: Schema.Types.ObjectId,
        },
        answer:{
            type:String
            },
    }
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

quizResponseSchema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });

 
  if (object.questions && Array.isArray(object.questions)) {
    object.questions = object.questions.map((q) => {
      const { _id, ...rest } = q;
      return { ...rest, id: _id };
    });
  }

  object.id = _id;
  return object;
});


quizResponseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("quizresponse", quizResponseSchema);

