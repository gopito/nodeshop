// Require express
var express = require('express');
// Set up express
var app = express();
var favicon=require('serve-favicon');
var session=require('express-session');
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'gopito',
    api_key: '886661892956561',
    api_secret: '1qWwpRZXhXy_-6S5nQSCL1fA2rM'
});
// Require mongostore session storage
var mongoStore = require('connect-mongo')(session);
var passport = require('passport');
var config = require('./shop/config.json');
var info = require('./package.json');
// Mongoose for database
var mongoose = require('mongoose');
// User model and local strategy for passport
var User = require('./schemas/user');
var LocalStrategy = require('passport-local').Strategy;

console.log('NodeShop Admin Started!');

// Passport authentication
passport.use(new LocalStrategy({usernameField: 'email'},function(email, password, done) {User.authenticate(email, password, function(err, user) {return done(err, user)})}));

// Session store
passport.serializeUser(function(user, done) {done(null, user.id)});
passport.deserializeUser(function(id, done) {User.findById(id, function (err, user) {done(err, user)})});

// Connect mongoose database
mongoose.connect(config.connection);
console.log('Connecting to database...');

// Listen for mongoose connection
mongoose.connection.on('open', function() {
    console.log('Connected to database!');
});

// Configure Express
var env = process.env.NODE_ENV || 'development';
if ('development' == env){
    
    // Set up jade
    app.set('views', __dirname + '/admin/views');
    app.set('view engine', 'jade');

    app.use(favicon(__dirname + '/shop/public/favicon.ico'));
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    // Set up sessions
    app.use(session({
        // Set up MongoDB session storage
        store: new mongoStore({url: 'mongodb://localhost:27017/test',
            maxAge: 300000}),
        // Set session to expire after 21 days
        cookie: { maxAge: new Date(Date.now() + 181440000)},
        // Get session secret from config file
        secret: config.cookie_secret,
        saveUninitialized: true,
        resave: true
        }));
    
    // Set up passport
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Define public assets
    app.use(express.static(__dirname + '/admin/public'));
  
}
    
// Require router, passing passport for authenticating pages
require('./admin/router')(app, passport);

// Listen for requests
app.listen(3000);

console.log('NodeShop v' + info.version + ' Admin Area listening on port 3000');

// Handle all uncaught errors
process.on('uncaughtException', function(err) {
    console.log(err);
});