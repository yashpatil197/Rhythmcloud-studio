require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();

// --- CONFIGURATION ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rhythmcloud-studio',
    resource_type: 'video', // 'video' handles audio in Cloudinary
    format: async () => 'mp3', 
  },
});
const upload = multer({ storage: storage });

// --- DATABASE ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

const UserSchema = new mongoose.Schema({
    googleId: String,
    displayName: String,
    email: String,
    photo: String,
    likedSongs: [String]
});
const User = mongoose.model('User', UserSchema);

const SongSchema = new mongoose.Schema({
    title: String,
    artist: String,
    url: String,
    cover: String,
    date: { type: Date, default: Date.now }
});
const Song = mongoose.model('Song', SongSchema);

// --- AUTHENTICATION ---
app.use(cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
    keys: [process.env.COOKIE_KEY]
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const photo = profile.photos ? profile.photos[0].value : '';
    
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
        user = await new User({ 
            googleId: profile.id, 
            displayName: profile.displayName,
            email: email,
            photo: photo
        }).save();
    }
    done(null, user);
  }
));

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.static('public')); // Serves the frontend
app.use(express.json());

const requireAdmin = (req, res, next) => {
    // Only allows the exact email in .env to upload
    if (req.user && req.user.email === process.env.ADMIN_EMAIL) {
        next();
    } else {
        res.status(403).send("Access Denied: Only The RhythmCloud Admin can upload.");
    }
};

// --- ROUTES ---

// Auth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    res.redirect('/');
});
app.get('/api/current_user', (req, res) => res.send(req.user));
app.get('/api/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

// Songs
app.get('/api/songs', async (req, res) => {
    const songs = await Song.find().sort({ date: -1 });
    res.send(songs);
});

// Admin Upload
app.post('/api/admin/upload', requireAdmin, upload.single('song'), async (req, res) => {
    if (!req.file) return res.send("No file uploaded");
    
    const newSong = new Song({
        title: req.body.title,
        artist: "The Rhythmcloud Studio",
        url: req.file.path, 
        cover: "https://cdn-icons-png.flaticon.com/512/9043/9043063.png" // Default Music Icon
    });
    await newSong.save();
    res.redirect('/');
});

// Likes
app.post('/api/songs/:id/like', async (req, res) => {
    if(!req.user) return res.status(401).send('Login required');
    const songId = req.params.id;
    const user = await User.findById(req.user.id);
    
    if (user.likedSongs.includes(songId)) {
        user.likedSongs = user.likedSongs.filter(id => id !== songId);
    } else {
        user.likedSongs.push(songId);
    }
    await user.save();
    res.send(user);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`RhythmCloud running on port ${PORT}`));
