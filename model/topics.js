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
     userId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
        },
    description: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "course" },
    serialKey: { type: Number,unique:true },
     userId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
        },
    videos:[
        {
            videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
            quizId: { type: mongoose.Schema.Types.ObjectId, ref: "quiz" },
            codeId:{
              type: mongoose.Schema.Types.ObjectId, ref: "code"
            },
            order: {
               type: String,
               default:"video",
               enum: ["video", "quiz"],
             },
             serialNo:{
              type:Number,
              default:1
             }
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
      isActive:{type:Boolean,default:true},
      isDeleted: { type: Boolean,default:false},
      createdAt: { type: Date },
      updatedAt: { type: Date },
})
TopicSchema.plugin(mongoosePaginate);

TopicSchema.method("toJSON", function () {
    const { _id, __v, ...object } = this.toObject({ virtuals: true });
    object.id = _id;
    delete object.password;
    return object;
  });

  const Topic = new mongoose.model("topic", TopicSchema);
  module.exports = Topic;