require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb://localhost:27017/userDB");
};

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});




const User = new mongoose.model("User", userSchema);



// Home route
app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username})
    .then((foundUser) => {
        if(foundUser){
            // Load hash from your password DB.
            bcrypt.compare(password, foundUser.password, function(err, result) {
                if (result == true){
                    res.render("secrets");
                }
            });
                
            
        }
    })
    .catch(err => console.log(err));
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        newUser.save()
        .then((user) => {
            if (user){
                res.render("secrets");
            }
        })
        .catch(err => console.log(err));
    });
    
});

app.listen(3000, function(req, res){
    console.log("Server is listening on port 3000");
});
