# ☁️ The RhythmCloud Studio

**The Official Cloud Workspace for The RhythmCloud Studio YouTube Channel.**

This is a full-stack audio streaming platform built for my YouTube channel. It allows me (the Admin) to upload edited audio tracks directly to the cloud, while subscribers can log in via Google to listen, download, and manage their "Liked Songs."



## 🚀 Features

### 🎧 For Users (Subscribers)
- **Google OAuth Login**: Secure sign-in to access the studio.
- **Cloud Streaming**: High-quality audio streaming from Cloudinary.
- **Personalized Library**: "Like" songs to save them to your profile.
- **Exclusive Downloads**: Direct download links for logged-in users.

### 👑 For Admin (Me)
- **Hidden Upload Studio**: A secure interface only visible to `yashpatil3495@gmail.com`.
- **Direct Cloud Uploads**: Uploads files from the browser directly to Cloudinary storage.
- **Metadata Management**: Auto-tagging of artist and cover art.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Dark Mode), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (User profiles & Song metadata)
- **Storage**: Cloudinary API (Audio hosting)
- **Auth**: Passport.js (Google Strategy)

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/rhythmcloud-studio.git](https://github.com/YOUR_USERNAME/rhythmcloud-studio.git)
   cd rhythmcloud-studio
