/**
 * authController.js
 *  @description :: exports authentication methods
 */

const User = require('../../../model/user');
const dbService = require('../../../utils/dbServices');
const userTokens = require('../../../model/userTokens');
const dayjs = require('dayjs');
const userSchemaKey = require('../../../utils/validation/userValidation');
const validation = require('../../../utils/validateRequest');
const authConstant = require('../../../constants/authConstant');
const authService = require('../../../services/auth');
const common = require('../../../utils/comon');
const {verifyToken} = require('../../../firebase/auth')
const jwt = require("jsonwebtoken");

/**
 * @description : user registration 
 * @param {Object} req : request for register
 * @param {Object} res : response for register
 * @return {Object} : response for register {status, message, data}
 */

const register = async (req,res) =>{
    try {
      let {
        phone,email, password
      } = req.body;
      if (!email && !phone) {
        return res.badRequest({ message: 'Insufficient request parameters! email or phone  is required.' });
      }
     
      // validation  
      let validateRequest = validation.validateParamsWithJoi(
        req.body,
        userSchemaKey.schemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message :  `Invalid values in parameters, ${validateRequest.message}` });
      } 

      if(req.body.email){
        let found = await User.findOne({email:email});
        if(found){
            return res.validationError({message : `${email} already exists.Unique email are allowed.`})
        }
    }
    if(req.body.phone){
        let found = await User.findOne({phone:phone});
        if(found){
            return res.validationError({message : `${phone} already exists.Unique phone are allowed.`})
        }
    }
     
      const data = new User({
        ...req.body,
        userType: authConstant.USER_TYPES.User
      });
     
    // create user
      const result = await dbService.create(User,data);

      return res.success({ data :result });
    } catch (error) {
      return res.internalServerError({ data:error.message });
    }  
  };
  
  /**
 * @description : login with username and password
 * @param {Object} req : request for login 
 * @param {Object} res : response for login
 * @return {Object} : response for login {status, message, data}
 */
const login = async (req, res) => {
    try {
      let {
        username, password, phone
      } = req.body;
     
      if (!(username || phone)) {
        return res.badRequest({ message: 'Insufficient request parameters! username  is required.' });
      }
      if (!password) {
        return res.badRequest({ message: 'Insufficient request parameters! password is required.' });
      }

      let roleAccess = false;
      let result = await authService.loginUser(username  , password, authConstant.PLATFORM.USERAPP, roleAccess);
      if (result.flag) {
        return res.badRequest({ message: result.data });
      }
      return res.success({
        data: result.data,
        message: 'Login Successful'
      });
    } catch (error) {
      return res.internalServerError({ data: error.message });
    }
  };

 

// OTP Sent

 /**
 * @description : send email or sms to user with OTP on forgot password
 * @param {Object} req : request for forgotPassword
 * @param {Object} res : response for forgotPassword
 * @return {Object} : response for forgotPassword {status, message, data}
 */
 const sentResetPasswordOtp = async (req, res) => {
  const params = req.body;
  try {
    if (!params.email && !params.phone) {
      return res.badRequest({ message: 'Insufficient request parameters! email or phone is required.' });
    }
    let where;
    if(params.email){
     where = { email: params.email };
    where.isActive = true; where.isDeleted = false; params.email = params.email.toString().toLowerCase();
    }
    if(params.phone){
       where = { phone: params.phone};
      where.isActive = true; where.isDeleted = false; 
      }

    let found = await dbService.findOne(User, where);
    if (!found) {
      return res.recordNotFound();
    }
    let {
      resultOfEmail, resultOfSMS
    } = await authService.sendResetPasswordOtpNotification(found);
    if (resultOfEmail && resultOfSMS) {
      return res.success({ message: 'otp successfully send.' });
    } else if (resultOfEmail && !resultOfSMS) {
      return res.success({ message: 'otp successfully send to your email.' });
    } else if (!resultOfEmail && resultOfSMS) {
      return res.success({ message: 'otp successfully send to your mobile number.' });
    } else {
      return res.failure({ message: 'otp can not be sent due to some issue try again later' });
    }
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};


  /**
 * @description : send email or sms to user with OTP on Register
 * @param {Object} req : request for forgotPassword
 * @param {Object} res : response for forgotPassword
 * @return {Object} : response for forgotPassword {status, message, data}
 */
  const sentRegisterOtp = async (req, res) => {
    const params = req.body;
    try {
      if (!params.email && !params.phone) {
        return res.badRequest({ message: 'Insufficient request parameters! email or phone is required.' });
      }
      let where;
      if(params.email){
       where = { email: params.email };
      where.isActive = true; where.isDeleted = false; params.email = params.email.toString().toLowerCase();
      }
      if(params.phone){
         where = { phone: params.phone};
        where.isActive = true; where.isDeleted = false; 
        }
  
        let found = await dbService.findOne(User, where);
        if (found) {
          return res.failure({ message: 'User is Already Exist' });
        } 
      let {
        resultOfEmail, resultOfSMS
      } = await authService.sendRegisterOtpNotification(where);
      console.log( resultOfEmail, resultOfSMS);
      if (resultOfEmail && resultOfSMS) {
        return res.success({ message: 'otp successfully send.' });
      } else if (resultOfEmail && !resultOfSMS) {
        return res.success({ message: 'otp successfully send to your email.' });
      } else if (!resultOfEmail && resultOfSMS) {
        return res.success({ message: 'otp successfully send to your mobile number.' });
      } else {
        return res.failure({ message: 'otp can not be sent due to some issue try again later' });
      }
    } catch (error) {
      return res.internalServerError({ data: error.message });
    }
  };

  /**
 * @description : send email or sms to user with OTP on forgot password
 * @param {Object} req : request for forgotPassword
 * @param {Object} res : response for forgotPassword
 * @return {Object} : response for forgotPassword {status, message, data}
 */
 const sentLoginOtp = async (req, res) => {
  const params = req.body;
  try {
    if (!params.email && !params.phone) {
      return res.badRequest({ message: 'Insufficient request parameters! email or phone is required.' });
    }
    let where;
    if(params.email){
     where = { email: params.email };
    where.isActive = true; where.isDeleted = false; params.email = params.email.toString().toLowerCase();
    }
    if(params.phone){
       where = { phone: params.phone};
      where.isActive = true; where.isDeleted = false; 
      }

    let found = await dbService.findOne(User, where);
    if (!found) {
      return res.recordNotFound();
    }
    let {
      resultOfEmail, resultOfSMS
    } = await authService.sendLoginOtpNotification(found);
    if (resultOfEmail && resultOfSMS) {
      return res.success({ message: 'otp successfully send.' });
    } else if (resultOfEmail && !resultOfSMS) {
      return res.success({ message: 'otp successfully send to your email.' });
    } else if (!resultOfEmail && resultOfSMS) {
      return res.success({ message: 'otp successfully send to your mobile number.' });
    } else {
      return res.failure({ message: 'otp can not be sent due to some issue try again later' });
    }
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};


// Validate OTP  

/**
 * @description : reset password with code and new password
 * @param {Object} req : request for resetPassword
 * @param {Object} res : response for resetPassword
 * @return {Object} : response for resetPassword {status, message, data}
 */
const resetPassword = async (req, res) => {
  const params = req.body;
  console.log(req.body.code)
  try {
    if (!params.code || !params.newPassword) {
      return res.badRequest({ message: 'Insufficient request parameters! code and newPassword is required.' });
    }
    const where = {
      'resetPasswordLink.code': params.code,
      isActive: true,
      isDeleted: false,
    };
    let found = await dbService.findOne(User, where);
    console.log(found);
    if (!found || !found.resetPasswordLink.expireTime) {
      return res.failure({ message: 'Invalid Code' });
    }
    if (dayjs(new Date()).isAfter(dayjs(found.resetPasswordLink.expireTime))) {
      return res.failure({ message: 'Your reset password link is expired or invalid' });
    }
    let response = await authService.resetPassword(found, params.newPassword);
    if (!response || response.flag) {
      return res.failure({ message: response.data });
    }
    return res.success({ message: response.data });
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};


  /**
 * @description : validate OTP
 * @param {Object} req : request for validateResetPasswordOtp
 * @param {Object} res : response for validateResetPasswordOtp
 * @return {Object} : response for validateResetPasswordOtp  {status, message, data}
 */
const validateOtp = async (req, res) => {
  const params = req.body;
  try {
    if (!params.otp) {
      return res.badRequest({ message: 'Insufficient request parameters! otp is required.' });
    }
    const where = {
      'resetPasswordLink.code': params.otp,
      isActive: true,
      isDeleted: false,
    };
    let found = await dbService.findOne(User, where);
    if (!found || !found.resetPasswordLink.expireTime) {
      return res.failure({ message: 'Invalid OTP' });
    }
    if (dayjs(new Date()).isAfter(dayjs(found.resetPasswordLink.expireTime))) {
      return res.failure({ message: 'Your reset password link is expired or invalid' });
    }
   let a = await dbService.updateOne(User, {_id:found.id}, { resetPasswordLink: {} });
   console.log(a)
    return res.success({ message: 'OTP verified' });
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};

/**
 * @description : logout user
 * @param {Object} req : request for logout
 * @param {Object} res : response for logout
 * @return {Object} : response for logout {status, message, data}
 */
const logout = async (req, res) => {
  try {
    let userToken = await dbService.findOne(userTokens, {
      token: (req.headers.authorization).replace('Bearer ', '') ,
      userId:req.user.id
    });
    let updatedDocument = { isTokenExpired: true };
    await dbService.updateOne(userTokens,{ _id:userToken.id }, updatedDocument);
    return res.success({ message :'Logged Out Successfully' });
  } catch (error) {
    return res.internalServerError({ data:error.message }); 
  }
};

const googleLogin  = async(req,res)=>{
  try {
      const {credentials} = req.body;
      console.log(credentials);
      if(!credentials){
          return res.badRequest({message : "Insufficient credentials"})
      }
      const check = await verifyToken(credentials)

      let objVal = {
          name: check.name,
          email: check.email,
          picture: check.picture,
          userType: authConstant.USER_TYPES.User
      }
      let user = await User.findOne({email:check.email})
      if(!user){
          user = await User.create(objVal)
      }
      let userData = user.toJSON();

      let token =  jwt.sign({userId:userData.id,email:userData.email},authConstant.JWT.USERAPP_SECRET,{expiresIn:authConstant.JWT.EXPIRES_IN})

      let expire = dayjs().add(authConstant.JWT.EXPIRES_IN, 'second').toISOString();
      await dbService.create(userTokens, { userId: userData.id, token: token, tokenExpiredTime: expire });

      let result = {...userData,token}
      
      return res.success({data:result})
  } catch (error) {
      console.log(error);
  }
}

  module.exports = {
    register,
    login,
    sentResetPasswordOtp,
    validateOtp,
    resetPassword,
    logout,
    sentRegisterOtp,
    sentLoginOtp,
    googleLogin
  };

