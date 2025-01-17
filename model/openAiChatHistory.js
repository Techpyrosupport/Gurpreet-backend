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


const HistorySchema = new Schema(
  {
    prompt: {
      type: String,
      required: true,
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "user" 
    },
    response: {
      type: String,
    },
    sessionId: { 
      type: String, 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

HistorySchema.method('toJSON', function () {
  const {
    _id, __v, ...object 
  } = this.toObject({ virtuals:true });
  object.id = _id;
     
  return object;
});

HistorySchema.plugin(mongoosePaginate);


const HistoryResponse = mongoose.model("chat", HistorySchema);

module.exports = {HistoryResponse };
