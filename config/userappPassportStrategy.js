const {
  Strategy, ExtractJwt, 
} = require('passport-jwt');
const { JWT } = require('../constants/authConstant');
const user = require('../model/user');


const userappPassportStrategy = (passport) => {
  const options = {};
  options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  options.secretOrKey = JWT.USERAPP_SECRET;
console.log(options)
  passport.use('userapp-rule',
    new Strategy(options, async (payload, done) => {
      try {
        const result = await user.findOne({ _id: payload.id });
        if (result) {
          return done(null, result.toJSON());
        }
        return done('No User Found', {});
      } catch (error) {
        return done(error,{});
      }
    })
  );
};

module.exports = { userappPassportStrategy };
