const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const userModel = require("./models/userModel");
const postModel = require("./models/postModel");
const bcrypt = require("bcrypt");
let salt = 10;
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

const mongoDB = () => {
  mongoose
    .connect("mongodb://localhost:27017/data-association")
    .then(() => {
      console.log("Server connected to MongoDB");
    })
    .catch((err) => {
      console.log("Error in connecting MongoDB", err);
    });
};
mongoDB();

const isLoggedIn = (req, res, next) => {
  if (req.cookies.token == "") {
    res.redirect("/login");
  } else {
    let data = jwt.verify(req.cookies.token, "secret");
    req.user = data;
    next();
  }
};

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/register", async (req, res) => {
  const { username, email, password, age } = req.body;
  let user = await userModel.findOne({ email });
  if (user) {
    res.send("User already exists!");
  } else {
    bcrypt.hash(password, salt, async (err, hash) => {
      if (err) {
        console.log("Error:", err);
      } else {
        await userModel.create({
          username,
          email,
          password: hash,
          age,
        });
      }
    });
    // let token = jwt.sign({ email: email, userid: user._id }, "secret");
    // res.cookie("token", token);
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    res.redirect("/");
  } else {
    let result = await bcrypt.compare(password, user.password);
    if (result) {
      const token = jwt.sign({ email: user.email, userid: user._id }, "secret");
      res.cookie("token", token);
      res.redirect("/profile");
    } else {
      res.send("Invalid password");
    }
  }
});

app.get("/profile", isLoggedIn, async(req, res) => {
    let user = await userModel.findOne({email : req.user.email}).populate("posts")
    res.render("profile",{user});
});

app.post("/post", isLoggedIn, async (req,res)=>{
    let user = await userModel.findOne({email : req.user.email})
    const {content} = req.body
    let post = await postModel.create({
        user : user._id,
        content,
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")
})

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/like/:id",isLoggedIn,async(req,res)=>{
  const {id} = req.params
  const userid = req.user.userid
  let post = await postModel.findOne({_id : id}).populate("user")
  if(post.likes.indexOf(userid) === -1){
    post.likes.push(userid)
  }
  else{
    post.likes.splice(post.likes.indexOf(userid),1)
  }
  await post.save()
  res.redirect("/profile")
})

app.get("/edit/:id",isLoggedIn,async(req,res)=>{
  const {id}=req.params
  let post = await postModel.findOne({_id : id}).populate("user")
  console.log(post);
  
  res.render("edit",{post})
})

app.post("/editpost/:id",isLoggedIn,async(req,res)=>{
  const {id} = req.params
  const {content} = req.body
  await postModel.findOneAndUpdate({_id:id},{content})
  res.redirect("/profile")
})

app.get("/delete/:id",async(req,res)=>{
  const {id} = req.params
  await postModel.findOneAndDelete({_id : id})
  res.redirect("/profile")
})


app.listen(3000, () => {
  console.log("Server run at http://localhost:3000");
});
