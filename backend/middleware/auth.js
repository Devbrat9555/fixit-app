const { createClerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Protect routes - verify Clerk JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    // Verify the token using Clerk SDK
    const decoded = await clerkClient.verifyJwt(token);
    const clerkId = decoded.sub;

    req.user = await User.findOne({ clerkId });

    if (!req.user) {
      // Auto-sync user if they don't exist in DB yet
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        
        // Check if user exists by email (if they registered previously with JWT)
        let existingUser = await User.findOne({ email });
        
        // ADMIN EMAIL CHECK
        const isAdmin = email === 'vrat1087@gmail.com';
        const role = isAdmin ? 'admin' : 'user';

        if (existingUser) {
          existingUser.clerkId = clerkId;
          if (isAdmin) {
            existingUser.role = 'admin';
            existingUser.hasFinishedSetup = true; // Skip selection for admin
          }
          await existingUser.save();
          req.user = existingUser;
        } else {
          req.user = await User.create({
            clerkId: clerkId,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
            email: email,
            role: role,
            isApproved: true,
            hasFinishedSetup: isAdmin, // Skip selection for admin
          });
        }
      } catch (err) {
        console.error("Auto-sync failed:", err);
        return res.status(401).json({ success: false, message: 'User sync failed: ' + err.message });
      }
    } else {
      // If user exists but is the admin email, double check role
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (email === 'vrat1087@gmail.com' && (req.user.role !== 'admin' || !req.user.hasFinishedSetup)) {
        req.user.role = 'admin';
        req.user.hasFinishedSetup = true;
        await req.user.save();
      }
    }

    if (!req.user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    }

    next();
  } catch (error) {
    console.error("Clerk Auth Error:", error.message);
    return res.status(401).json({ success: false, message: 'Not authorized: ' + error.message });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if provider is approved
const requireApproved = (req, res, next) => {
  // Bypassed as requested - All providers are now auto-approved
  next();
};

module.exports = { protect, authorize, requireApproved };
