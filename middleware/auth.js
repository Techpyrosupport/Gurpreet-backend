
const passport =require("passport");
const{ LOGIN_ACCESS, PLATFORM, JWT } =require( "../constants/authConstant.js");
const userTokens = require("../model/userTokens.js");
const dbService = require("../utils/dbServices.js");
const jwt = require("jsonwebtoken");
/**
 * @description :returns callbackthat verifies require right and access.
 * @param req : request for a route.
 * @param {callback} resolve : resolve the sceccinding process.
 * @param {callback} reject :reject for an error.
 * @param {string} plateForm : platform to check if user has access or not.
 */



const verifyCallback = (req, resolve, reject, platform) => async (error, user, info) => {

  try {
    if (error) {
      console.error('Authentication error:', error);
      return reject('Authentication error');
    }
    if (info || !user) {
      console.warn('Authentication failed:', info || 'No user found');
      return reject('Unauthorized User');
    }

    req.user = user;

    if (!user.isAppUser) {
      return reject('User is not an application user');
    }
    if (user.isDeleted) {
      return reject('User account is deactivated');
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return reject('Authorization token is missing');
    }

    const userToken = await dbService.findOne(userTokens, { token, userId: user.id });

    if (!userToken) {
      return reject('Token not found');
    }
    if (userToken.isTokenExpired) {
      return reject('Token is expired');
    }

    const allowedPlatforms = LOGIN_ACCESS[user.userType] || [];
    if (!allowedPlatforms.includes(platform)) {
      return reject(`Access denied for platform: ${platform}`);
    }

    resolve();
  } catch (err) {
    console.error('Verification error:', err);
    reject('Internal server error during verification');
  }
};



/**
 * @description : authentication middleware for request.
 * @param {Object} req : request of route.
 * @param {Object} res : response of route.
 * @param {callback} next : executes the next middleware succeeding the current middleware.
 * @param {int} platform : platform
 */


 const auth = (platform) => async (req, res, next) => {


    if (platform == PLATFORM.USERAPP) {
      return new Promise((resolve, reject) => {
        passport.authenticate('userapp-rule', { session: false }, verifyCallback(req, resolve, reject, platform))(
          req,
          res,
          next
        );
      })
        .then(() => next())
        .catch((error) => {
          return res.unAuthorized({ message: error.message });
        });
    }
    else if (platform == PLATFORM.ADMIN) {
      return new Promise((resolve, reject) => {
        passport.authenticate('admin-rule', { session: false }, verifyCallback(req, resolve, reject, platform))(
          req,
          res,
          next
        );
      })
        .then(() => next())
        .catch((error) => {
          return res.unAuthorized({ message: error.message });
        });
    }
   
  };


  module.exports = auth;