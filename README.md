<div align="center">

# 🔗 Untie

### Discord Activity Eraser

A sleek web dashboard to view and erase your Discord activity across servers, DMs, and group chats.

[![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Selfbot-red.svg)](https://discord.com)

[Features](#-features) • [Quick Start](#-quick-start) • [Manual Setup](#-manual-setup) • [Usage](#-usage) • [Disclaimer](#%EF%B8%8F-disclaimer)

</div>

---

## ✨ Features

- 🎯 **Auto-load Activity** - Messages automatically load when you click on a server or channel
- 🗑️ **Bulk Delete** - Delete all your messages in a server or channel with one click
- ✅ **Selective Delete** - Pick specific messages to delete with checkboxes
- 🎨 **Customizable Themes** - Choose from Matte Black, Deep Blue, or Light mode
- 🌈 **Accent Colors** - 8 accent colors to personalize your experience
- 🔒 **Confirmation Dialogs** - Safety prompts before destructive actions
- 📊 **Dashboard Overview** - See all your servers, DMs, and group chats at a glance
- 🚪 **Leave Servers** - Quickly leave unwanted servers

## 🚀 Quick Start

### One-Command Setup

```bash
python setup.py
```

The setup script will:
1. ✓ Check for Python 3.7+ and Node.js
2. ✓ Install all backend dependencies (Flask, discord.py, etc.)
3. ✓ Install all frontend dependencies (React, Vite, etc.)
4. ✓ Create configuration files
5. ✓ Start both servers automatically

Then open **http://localhost:5173** in your browser.

## 📦 Manual Setup

If you prefer manual installation:

### Prerequisites

- Python 3.7 or higher
- Node.js 16 or higher
- npm (comes with Node.js)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python server.py
```

The backend runs on **http://localhost:5000**

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:5173**

## 💡 Usage

1. **Start the servers** (using `python setup.py` or manually)
2. **Open your browser** to http://localhost:5173
3. **Enter your Discord token** to connect
4. **Browse** your servers, DMs, and group chats
5. **Click on any server/channel** - messages load automatically
6. **Delete messages**:
   - Click "Delete All Messages" to remove everything
   - Or select specific messages and click "Delete Selected"
7. **Customize** your experience in Settings (accent color & theme)

### Getting Your Discord Token

> ⚠️ **Warning**: Never share your Discord token with anyone!

1. Open Discord in your browser (not the app)
2. Press `F12` to open Developer Tools
3. Go to the **Application** tab
4. In the left sidebar, expand **Local Storage**
5. Click on **https://discord.com**
6. Find the key that starts with `token` (it's stored in plain text)
7. Copy the token value (without quotes)


## 🛠️ Tech Stack

### Backend
- **Flask** - Web framework
- **discord.py 1.7.3** - Discord API wrapper
- **aiohttp** - Async HTTP client
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS 4** - Utility-first CSS
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📁 Project Structure

```
untie/
├── backend/
│   ├── server.py           # Flask REST API
│   ├── discord_client.py   # Discord selfbot client
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Configuration (create this)
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── components/    # React components
│   │   ├── api.ts         # API client
│   │   └── App.tsx        # Main app component
│   ├── package.json       # Node dependencies
│   └── vite.config.ts     # Vite configuration
├── setup.py               # Automated setup script
└── README.md
```

## 🔧 Configuration

### Optional: Auto-connect with Token

Create a `.env` file in the `backend` directory:

```env
DISCORD_TOKEN=your_token_here
```

This will automatically connect when you start the backend (optional - you can also enter the token via the web UI).

## ⚠️ Disclaimer

**IMPORTANT**: Using selfbots (user token automation) **violates Discord's Terms of Service**. 

- This tool is for **educational purposes** and **personal account cleanup** only
- Use at your own risk - your account may be banned
- The developers are not responsible for any consequences
- This is not affiliated with or endorsed by Discord

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch 
3. Commit your changes
4. Push to the branch 
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [discord.py](https://github.com/Rapptz/discord.py)
- UI inspired by modern Discord clients
- Icons by [Lucide](https://lucide.dev/)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ for personal account cleanup

</div>
