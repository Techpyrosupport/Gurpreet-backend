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

const videoSchema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    thumbnailUrl: {
      type: String,
    },
    views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      dislikes: {
        type: Number,
        default: 0,
      },
   
      tags: {
        type: [String],
        default: [],
      },
    createdBy: {
      ref: "user",
      type: Schema.Types.ObjectId,
      validate: {
        validator: async function (value) {
          const user = await mongoose.model("user").findById(value);
          return !!user;
        },
        message: "User does not exist.",
      },
    },
    updatedBy: {
      ref: "user",
      type: Schema.Types.ObjectId,
      validate: {
        validator: async function (value) {
          const user = await mongoose.model("user").findById(value);
          return !!user;
        },
        message: "User does not exist.",
      },
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
   
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

// Custom `toJSON` method to transform the output
videoSchema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  return object;
});

// Add the pagination plugin
videoSchema.plugin(mongoosePaginate);

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
