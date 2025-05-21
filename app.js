
const { cookie } = require('express/lib/response');

const userModel = require('./models/user')
const postModel = require('./models/post')

const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const express = require('express')
const app = express()
const port = 3000

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.get('/', (req, res) => {
  res.render('index');
});

app.get('/createUser', (req, res) => {
  res.render('createUser');
});

app.get('/loginUser', (req, res) => {
  res.render('loginUser');
});
app.get('/logoutUser',isLoggedIn, (req, res) => {
  res.cookie("token", "");
  console.log(req.data);
  res.redirect("/loginUser");
});
app.get("/userProfile", isLoggedIn, async(req,res)=>{
  console.log(req.user);
  let user = await userModel.findOne({email: req.user.email})
  console.log("The required user is : ", user);
  res.render("userProfile", {username:user.name});
});
app.post("/userProfilePost", isLoggedIn, async(req,res)=>{
  let user = await userModel.findOne({email: req.user.email});
  console.log("The req.body for userProfilePost is : ", req.body);
  let post_content=req.body.post_area_content;
  let post = postModel.create({
    user: user._id,
    content: post_content
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect('/userProfile');
})


app.post('/loginUser', async(req, res) => {
  const {email, password} = req.body;
  console.log("Email is : ", email, "password is : ", password);
  try {
    let check = await userModel.findOne({email:email});
    if(!check) return res.status(500).send("Either the password or the Email is incorrect!");
    console.log("This is the check :", check);
    let result = await bcrypt.compare(password, check.password);
    if(result){
      const token = jwt.sign({email: check.email, userid: check._id}, "shhh");
      res.cookie("token", token, );
      res.redirect("/userProfile");
    }
    else{
      res.status(500).send("Either the password or the email is incorrect!");
    }
  } catch(error){
    console.log(error);
    res.status(500).send("An unusual errro occured. Please try again!");
  }

});

app.post('/createUser', async(req, res) => {
  console.log(req.body.params)
  let {name, age, email, password} = req.body;
  let user = await userModel.findOne({email: email})
  if(user) return res.status(500).send("User already registered!")
  
  bcrypt.genSalt(10, (err, salt)=>{
    bcrypt.hash(password, salt, async(err, hash)=>{
      let user = await userModel.create({name, age, email, password:hash});
      console.log("The user is ",user);
      let token = jwt.sign({email:email, userid: user._id}, "shhh");
      res.cookie("token", token);
      res.redirect('/') 
    });
  });
});

function isLoggedIn(req, res, next){
  console.log("The cookies are : ",req.cookies.token);
  if(req.cookies.token==="") res.send("You must be logged in to do this");
  let data = jwt.verify(req.cookies.token, "shhh");
  req.user = data;

  next();
}


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});