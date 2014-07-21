// Require express
var express = require('express');
var i18n = require('i18next');
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
//i18n.init({//internationalization init
//    saveMissing: true,
//    debug: true
//});
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
database.startup(config.connection);
console.log('Connecting to database...');
  
// Configure Express
var env = process.env.NODE_ENV || 'development';
if ('development' == env){
    
    // Set up jade
//    app.use(i18n.handle); //internationalization init
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
        store: new mongoStore({url: config.connection,
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
//i18n.registerAppHelper(app);

// Require router, passing passport for authenticating pages
var router=require('./shop/router.js')(app, passport);

// Listen for requests
app.listen(3001);

console.log('NodeShop v' + info.version + ' listening on port 3001');

// Handle all uncaught errors
process.on('uncaughtException', function(err) {
    console.log(err);
});