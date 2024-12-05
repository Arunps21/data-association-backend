const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId,ref:"user" },
  content: { type: String },
  likes : [
    {
        type : mongoose.Schema.Types.ObjectId, ref : "user"
    }
  ]
},{timestamps:true});

const postModel = mongoose.model("post",postSchema)

module.exports = postModel