const express = require('express');
const session = require('express-session');
const cors = require('cors');
const logger = require('morgan');
const cookieParser = require("cookie-parser")

const path = require('path');
global.__basedir = __dirname;
// all routes
const routes = require("./routes")

const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const dbConnection = require('./config/db');
const { userappPassportStrategy } = require('./config/userappPassportStrategy');
const { adminPassportStrategy } = require('./config/adminPassportStrategy');
const passport = require('passport');
const { encryptResponseMiddleware } = require('./middleware/encryptResponse');
dbConnection();

var whitelist = ['https://admin.techpyro.com','https://admin.techpyro.in', 'https://techpyro.com', 'https://techpyro.in',  'https://www.techpyro.com', 'https://www.techpyro.in', 'https://contact.techpyro.com', 'https://contact.techpyro.in', 'https://about.techpyro.com', 'https://about.techpyro.in']
whitelist.push('http://localhost:3000')
whitelist.push('http://localhost:3001')
var corsOptionsDelegate = function (req, callback) {
  var corsOption;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOption = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOption = { origin: false } // disable CORS for this request
  } 
  console.log('corsOptions', corsOption)
  callback(null, corsOption) // callback expects two parameters: error and options
}


const app = express();
const port = process.env.PORT || 8000;

app.use(require('./utils/response/responseHandler'));
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(encryptResponseMiddleware)
app.use(passport.initialize())
app.use(session({
  secret: 'my-blog-secret',
  resave: true,
  saveUninitialized: false
}));
app.use(cookieParser())
app.use(routes)


// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

userappPassportStrategy(passport);
adminPassportStrategy(passport);


    app.listen(port, () => {
      console.log(`your application is running on ${port}`);
    });