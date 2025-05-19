const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { getGravatarUrl } = require("../utils/gravatarUrl");

/**
 * Register a new user
 */
const register = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        errors: [
          { param: "email", msg: "User with this email already exists." },
        ],
      });
    }

    // Generate Gravatar URL
    const profileImageUrl = getGravatarUrl(email);

    // Create new user
    user = new User({
      fullname,
      email,
      password,
      profileImageUrl,
    });

    // Save user to database
    await user.save();

    // Create JWT payload
    const payload = {
      id: user.id,
    };

    // Sign JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Return user data without password
    return res.json({
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(400).json({
        errors: [{ param: "email", msg: "Password or email is incorrect" }],
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);

    // Check if passwords match
    if (!isMatch) {
      return res.status(400).json({
        errors: [{ param: "password", msg: "Password or email is incorrect" }],
      });
    }

    // Create JWT payload
    const payload = {
      id: user.id,
    };

    // Sign JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Return user data without password
    return res.json({
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already set in req.user by auth middleware
    return res.json({ user: req.user });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Logout user
 */
const logout = (req, res) => {
  try {
    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete user account
 */
const deleteAccount = async (req, res) => {
  try {
    // Delete user from database
    await User.findByIdAndDelete(req.user.id);

    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  deleteAccount,
};
