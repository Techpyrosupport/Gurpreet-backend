const express = require('express');
const session = require('express-session');
const cors = require('cors');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const passport = require('passport');

// Load environment variables
dotenv.config({ path: '.env' });

// Database connection and strategies
const dbConnection = require('./config/db');
const { userappPassportStrategy } = require('./config/userappPassportStrategy');
const { adminPassportStrategy } = require('./config/adminPassportStrategy');

// Routes and middleware
const routes = require('./routes');
const { encryptResponseMiddleware } = require('./middleware/encryptResponse');
const responseHandler = require('./utils/response/responseHandler');

// Initialize the app and database connection
const app = express();
dbConnection();

// Define the base directory for global use
global.__basedir = __dirname;

// Whitelist for CORS
const whitelist = [
  'https://admin.techpyro.com',
  'https://admin.techpyro.in',
  'https://techpyro.com',
  'https://techpyro.in',
  'https://www.techpyro.com',
  'https://www.techpyro.in',
  'https://contact.techpyro.com',
  'https://contact.techpyro.in',
  'https://about.techpyro.com',
  'https://about.techpyro.in',
  'http://localhost:3000',
  'http://localhost:3001',
];

// CORS options
const corsOptionsDelegate = function (req, callback) {
  const corsOptions = whitelist.includes(req.header('Origin'))
    ? { origin: true }
    : { origin: false };
  console.log('CORS options:', corsOptions);
  callback(null, corsOptions); // Pass error and options
};

// Middleware setup
app.use(cors(corsOptionsDelegate));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(responseHandler); // Attach the custom response handler

// Initialize Passport strategies
app.use(passport.initialize());
userappPassportStrategy(passport);
adminPassportStrategy(passport);

// Session configuration
app.use(
  session({
    secret: 'my-blog-secret',
    resave: true,
    saveUninitialized: false,
  })
);

// Static file serving
app.use('/codemirror-5.65.18', express.static(path.join(__dirname, 'codemirror-5.65.18')));


app.use('/compiler',(req, res) => {
  if (typeof compiler !== 'undefined' && typeof compiler.flush === 'function') {
    compiler.flush(() => {
      console.log('Temporary files deleted');
    });
  }
  console.log("hello from compiler")
  res.sendFile(path.join(__dirname, 'index.html'));
})

// Attach application routes
app.use(routes);

// Server start
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Your application is running on port ${port}`);
});
