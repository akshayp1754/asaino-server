const jwt = require("jsonwebtoken");
exports.verifyAuthToken = (token) => {
  console.log("token in verify", token);
  
  try {
   const payload = jwt.verify(token, process.env.AUTH_SECRET);
    return payload;
  } catch (error) {
    return error.message;
  }
};

exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.AUTH_SECRET, { expiresIn: "1d" });
};

exports.generateResetToken = (payload) => {
  return jwt.sign(payload, process.env.RESET_PASSWORD_SECRET, {
    expiresIn: "5m",
  });
};

exports.verifyResetToken = (token) => {
  try {
   const payload = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
};
