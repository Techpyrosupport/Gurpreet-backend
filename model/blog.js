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
    title: String,
    subTitle: String,
    category: String,
    readTime: Number,
    metatitle: String,
    metadescription: String,
    image: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    description: String,
    tags: String,
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    isDeleted: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    like: [
      {
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
    ],
    likeCount: { type: Number, default: 0 },
    comments: [
      {
        author: String,
        picture: String,
        body: String,
        like: [
          {
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
        ],
        likeCount: { type: Number, default: 0 },
        commentCreatedAt: { type: Date },
      },
    ],
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      commentCreatedAt: "commentCreatedAt",
    },
  }
);

schema.pre("save", async function (next) {
  this.isDeleted = false;
  next();
});

schema.pre("insertMany", async function (next, docs) {
  if (docs && docs.length) {
    for (let index = 0; index < docs.length; index++) {
      const element = docs[index];
      element.isDeleted = false;
    }
  }
  next();
});

schema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;

  return object;
});
schema.plugin(mongoosePaginate);
const blog = mongoose.model("blog", schema);
module.exports = blog;
