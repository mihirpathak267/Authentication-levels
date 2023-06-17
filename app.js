require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");   
const { use } = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: "I love fuzzy",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// main().catch(err => console.log(err));

// async function main() {
//     await mongoose.connect("mongodb://localhost:27017/userDB")
// };
// mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true } )

// .then(() => console.log('Connected Successfully'))

// .catch((err) => { console.error(err); });
mongoose.connect('mongodb://127.0.0.1:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // wait up to 5 seconds for server selection
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
// Add plugin to userSchema to use it for sessions
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
// After creating model we use passport.use Strategy for local Strategy
passport.use(User.createStrategy());
// passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// Home route
app.get("/", function(req, res){
    res.render("home");
});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
})
app.get('/logout', function(req,res) {
    req.logout(function(err){
        console.log(err);
    })
    
    res.redirect('/')
})
app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if (err){
        console.log(err);
    } else {
        passport.authenticate("local")(req, res, function () {
            res.redirect("/secrets");
        })
    }
  })
});

app.get("/register", function(req, res){
    res.render("register");
});


app.post("/register", function(req, res){

    User.register({username: req.body.username}, req.body.password)
    .then((user) => {
        passport.authenticate('local', {failureRedirect: "/"})(req, res, () => {
            res.redirect("/secrets")
        })
        
    })
    .catch(err => console.log(err));
    //     function(err, user){
    //     if(err){
    //         console.log(err);
    //         res.redirect("/register")
    //     }else{
    //         passport.authenticate("local")(req, res, function(){
    //             res.redirect("/secrets")
    //         })
    //     }
    // })
    
});

app.listen(3000, function(req, res){
    console.log("Server is listening on port 3000");
});
