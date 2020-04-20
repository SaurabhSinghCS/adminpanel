var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var User = require("./models/user");
var userdata = require("./models/user_data");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride=require('method-override');


const express = require('express');
const app = express();
const http = require('http').Server(app);
app.use(methodOverride('_method'));


mongoose.connect("mongodb://localhost/adminpanel", function (err, db) {
    if (!(err)) console.log("you are connected to mongodb");
    if(err) console.log('not connected to mongodb');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "Rusty is the best og in the world",
    resave: false,
    saveUninitialized: false
}));

var db=mongoose.connection; 
db.on('error', console.log.bind(console, "connection error")); 
db.once('open', function(callback){ 
    console.log("connection succeeded"); 
})

var items=db.collection('userdata');
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.set('view engine', 'ejs');
//
app.use(passport.initialize());
app.use(passport.session());

// 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.render("index");
});

app.get("/register",function(req, res){
    res.render('register');
});


//handling user sign up
app.post("/register", function (req, res) {
    User.register(new User({ username: req.body.username,email: req.body.email,name: req.body.name }),req.body.password, function (err, user) {
        if (err) {
            return res.render('/register');
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/admin_panel");
        });
    });
});


// after login
app.get("/admin_panel",isLoggedIn, function (req, res) {
    items.find({}).toArray(function(err,data){
        if(err) throw err;
        res.render("admin_panel",{data:data,user: req.user});
    });
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/admin_panel",
    failureRedirect: "/"
}), function (req, res) {
    res.send("User is " + req.user.id);
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
};

app.delete("/admin_panel/:username", function(req, res)
{
   items.findOneAndDelete({username: req.params.username}, function(err)
   {
       if(!err) res.redirect('/admin_panel');
       else throw(err);
   })
})

var port = process.env.port || 3000;
const server = http.listen(port, function () {
    console.log('listening on *:'+port);
});

module.exports=User;
module.exports=mongoose;