const User = require('../models/User');
const OTPVerification = require('../models/OTPVerification'); // 🔑 NEW IMPORT
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 💡 Placeholder for your email sending utility
// You must implement this function using Nodemailer or a similar service.
// const sendEmail = async ({ to, subject, text }) => {
//     console.log(`[EMAIL MOCK] Sending to ${to}: ${subject} - ${text}`);
const sendEmail = require('../utils/sendEmail');

    // Implement your Nodemailer logic here!
    // Example: await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
// };


// @desc    Generate and send OTP for verification
// @route   POST /api/auth/send-otp
const sendOtp = async (req, res) => {
    const { email } = req.body;

    // 1. Validate email format (matching frontend validation)
    if (!email || !email.toLowerCase().endsWith('.edu.pk')) {
        return res.status(400).json({ error: 'Registration is restricted to institutional emails ending in .edu.pk.' });
    }
    
    // 2. Check if user is already fully registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'A user with this email is already registered.' });
    }

    try {
        // 3. Generate unique 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); 

        // 4. Save/Update OTP in database (resets expiration time)
        await OTPVerification.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: new Date() }, 
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 5. Send email to the user
        await sendEmail({
            to: email,
            subject: 'CampusTracker Email Verification Code',
            text: `Your CampusTracker verification code is: ${otpCode}. It expires in 10 minutes.`
        });

        res.status(200).json({ message: 'Verification code sent successfully.' });
        
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Server error during OTP generation or email sending.' });
    }
};


// @desc    Register a new user (Modified to include OTP verification)
// @route   POST /api/auth/signup
const signup = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body; // 🔑 NOW REQUIRES OTP

        // 1. Basic check for all fields
        if (!name || !email || !password || !otp) {
            return res.status(400).json({ error: 'Missing required registration fields, including OTP.' });
        }
        
        // 2. 🔑 OTP Validation: Find the matching, unexpired OTP record
        const otpRecord = await OTPVerification.findOne({ email, otp });

        if (!otpRecord) {
            // If the record doesn't exist, it's either an invalid code or it expired (Mongoose TTL index handles expiration)
            return res.status(401).json({ error: 'Invalid or expired verification code.' });
        }

        // 3. Final Checks
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // 4. Encrypt the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create the user
        await User.create({
            name,
            email,
            password: hashedPassword
        });
        
        // 6. 🔑 Cleanup: Delete the used OTP record
        await OTPVerification.deleteOne({ email });

        res.status(201).json({ message: "User registered and email verified successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Login user & get token (No change needed here)
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // 2. Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // 3. Generate Token (The "Key Card")
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d' // Token valid for 1 day
        });

        // Assuming user schema has a 'role' property, we should include it here
        res.json({
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                role: user.role || 'User' // Default to 'User' if not specified
            } 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { signup, login, sendOtp }; // 🔑 EXPORT sendOtp