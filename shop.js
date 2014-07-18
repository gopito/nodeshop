// Require express
var express = require('express');
// Set up express
var favicon=require('serve-favicon');
var session=require('express-session');
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var app = express();
// Require mongostore session storage
var mongoStore = require('connect-mongo')(session);
var passport = require('passport');
// Require needed files
var database = require('./shop/data.js');
var config = require('./shop/config.json');
var info = require('./package.json');

console.log('NodeShop Started!');

// Connect to database
database.startup("mongodb://localhost:27017/nodeshop");
console.log('Connecting to database...');
  
// Configure Express
var env = process.env.NODE_ENV || 'development';
if ('development' == env){
    
    // Set up jade
    app.set('views', __dirname + '/shop/views');
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
    app.use(express.static(__dirname + '/shop/public'));
  
}
    
// Require router, passing passport for authenticating pages
var router=require('./shop/router.js')(app, passport);

// Listen for requests
app.listen(3000);

console.log('NodeShop v' + info.version + ' listening on port 3000');

// Handle all uncaught errors
process.on('uncaughtException', function(err) {
    console.log(err);
});