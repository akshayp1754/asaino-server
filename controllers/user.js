const User = require('../schema/user');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/token');

const handleResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    message,
    success: status >= 200 && status < 300,
    data,
  });
};

const createUserToken = (user) => {
  return generateToken({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });
};

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body)

    await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    return handleResponse(res, 201, "Signup successful");
  } catch (err) {
    console.log(err.message)
    return handleResponse(res, 500, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ 
      where: { email },
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = createUserToken(user);

    // Return success response
    return res.status(200).json({ 
      success: true,
      token 
    });
    
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: err.message 
    });
  }
};
