//  Government Internship Portal - Backend
//  FILE: server.js


// 1. Import required packages
const express = require('express');       // Web framework
const mongoose = require('mongoose');     // Database connector
const bcrypt = require('bcryptjs');       // Password hashing (security!)
const cors = require('cors');             // Allows your HTML pages to talk to this server
const path = require('path');             // Helps with file paths

// 2. Create the Express app
const app = express();
const PORT = 3000;

// 3. Middleware — these run on every request
app.use(cors());                          // Allow cross-origin requests
app.use(express.json());                  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static(path.join(__dirname, 'public'))); // Serve your HTML files


//  4. Connect to MongoDB database

mongoose.connect('mongodb://localhost:27017/internship_portal')
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.log('MongoDB connection error:', err));

// ============================================================
//  5. Define Data Models (what gets stored in the database)
// ============================================================

// --- User Model (for registration & login) ---
const userSchema = new mongoose.Schema({
  fullName:    { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  username:    { type: String, required: true, unique: true },
  password:    { type: String, required: true },   // Will be hashed, never stored plain
  domain:      { type: String, required: true },
  role:        { type: String, default: 'student' }, // 'student' or 'admin'
  createdAt:   { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- Application Model (when a student applies for an internship) ---
const applicationSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:     { type: String, required: true },
  fullName:     { type: String, required: true },
  domain:       { type: String, required: true },
  statement:    { type: String, required: true },  // Why they want this internship
  status:       { type: String, default: 'Pending' }, // Pending / Approved / Rejected
  appliedAt:    { type: Date, default: Date.now },
  reviewedAt:   { type: Date }
});

const Application = mongoose.model('Application', applicationSchema);

//  6. API Routes

// --- HEALTH CHECK ---
// Visit http://localhost:3000/api/health to check if server is running
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

//  REGISTRATION ROUTE
//  POST /api/register
//  Called when a student submits the registration form
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, username, password, confirm, domain } = req.body;

    // Validation checks
    if (!fullName || !email || !username || !password || !domain) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password !== confirm) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already registered.' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user to the database
    const newUser = new User({
      fullName,
      email,
      username,
      password: hashedPassword,
      domain
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});


//  LOGIN ROUTE
//  POST /api/login
//  Called when a student submits the login form
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Login successful — send back user info
    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        domain: user.domain,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

//  APPLY FOR INTERNSHIP ROUTE
//  POST /api/apply
//  Called when a student submits an application
app.post('/api/apply', async (req, res) => {
  try {
    const { userId, username, fullName, domain, statement } = req.body;

    if (!userId || !domain || !statement) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check if the student already applied for this domain
    const existing = await Application.findOne({ userId, domain });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this domain.' });
    }

    const application = new Application({ userId, username, fullName, domain, statement });
    await application.save();

    res.status(201).json({ success: true, message: 'Application submitted successfully!' });

  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

//  GET APPLICATION STATUS ROUTE
//  GET /api/status/:userId
//  Called to check a student's application status
app.get('/api/status/:userId', async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.params.userId });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

//  ADMIN - GET ALL APPLICATIONS
//  GET /api/admin/applications
//  Admin can see all pending applications
app.get('/api/admin/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({ appliedAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

//  ADMIN - REVIEW AN APPLICATION
//  PATCH /api/admin/review/:applicationId
//  Admin can approve or reject an application
app.patch('/api/admin/review/:applicationId', async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status, reviewedAt: new Date() },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.json({ success: true, message: `Application ${status}.`, application });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

//  GET ALL USERS (Admin only)
//  GET /api/admin/users
app.get('/api/admin/users', async (req, res) => {
  try {
    // Never return passwords
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

//  7. Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API Health Check: http://localhost:${PORT}/api/health`);
});
