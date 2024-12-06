const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  password: { type: String },
  age: { type: Number },
  profilepic : {
    type : String,
    default : "default.png"
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
