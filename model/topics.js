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
const TopicSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "course" },
    serialKey: { type: Number,unique:true },
    videos:[
        {
            videoId: { type: mongoose.Schema.Types.ObjectId, ref: "video" },
            order: {
               type: Number,
              unique:true ,
              required: true
             },
        }
    ],
    quizzes:[
        {
            quizId: { type: mongoose.Schema.Types.ObjectId, ref: "quiz" },
            order: { type: Number,
              unique:true ,
              required: true
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
})


TopicSchema.method("toJSON", function () {
    const { _id, __v, ...object } = this.toObject({ virtuals: true });
    object.id = _id;
    delete object.password;
    return object;
  });

  const Topic = new mongoose.model("topic", TopicSchema);
  module.exports = Topic;