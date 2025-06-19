# CardXpert AI - Credit Card Recommendation Chatbot

A modern, AI-powered conversational assistant that provides personalized credit card recommendations based on user financial profiles and spending patterns.

## 🎯 Overview

CardXpert AI is an intelligent chatbot built with Next.js and Google Gemini AI that helps users find the perfect credit card by analyzing their income, spending habits, and preferences through natural conversation. The application features a clean, modern interface with real-time chat capabilities and smart recommendation algorithms.

## ✨ Features

### 🤖 **Intelligent Conversational AI**
- **Natural Language Processing** - Powered by Google Gemini AI for human-like conversations
- **Smart Income Detection** - Automatically detects salary ranges from various input formats (50k, 75000, 1.2 lakh)
- **Context-Aware Responses** - Maintains conversation history and builds user profile progressively
- **Fallback System** - Mock responses ensure functionality even when AI service is unavailable

### 💳 **Personalized Recommendations**
- **Dynamic Card Matching** - Intelligent scoring algorithm matches cards based on user profile
- **Multi-Factor Analysis** - Considers income, spending habits, preferred benefits, and fee preferences
- **Real-Time Profile Building** - Visual display of extracted user preferences as conversation progresses
- **Smart Recommendations** - Shows top 2-3 cards with match percentages and detailed reasoning

### 🎨 **Modern User Interface**
- **Floating Input Bar** - Fixed bottom input that stays accessible while scrolling
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Real-Time Chat** - Smooth message flow with typing indicators and auto-scroll
- **Profile Visualization** - Color-coded badges showing detected user preferences
- **Loading States** - Elegant loading animations and error handling

### 💾 **Data Management**
- **Local Storage Persistence** - Chat history and user profile saved locally
- **Dynamic Data Loading** - Loads credit card data from JSON files
- **Profile Extraction** - Automatically extracts and categorizes user information
- **Session Management** - Maintains conversation state across page refreshes

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **React 18** - Component-based UI library
- **Tailwind CSS** - Utility-first CSS framework for styling
- **JavaScript (ES6+)** - Modern JavaScript features

### **AI & Backend**
- **Google Gemini AI** - Conversational AI for natural language processing
- **Next.js API Routes** - Serverless API endpoints
- **Google Generative AI SDK** - Official SDK for Gemini integration

### **Data & Storage**
- **Local Storage** - Client-side data persistence
- **JSON Files** - Credit card database storage
- **Dynamic Imports** - Efficient data loading

### **Development Tools**
- **npm** - Package management
- **Git** - Version control
- **VS Code** - Development environment

## 📁 Project Structure


```bash
credit-card-recommendation-system/
├── app/
│   ├── components/           # Reusable UI components
│   ├── layout.js             # Root layout
│   ├── page.js               # Home page
│   ├── globals.css           # Global CSS
│   └── cardlist/             # Dynamic route for card details
│       └── [cardId]/page.js  # Individual card detail page
├── public/                   # Public assets like images and favicon
├── scripts/                  # Data processing or scraping scripts
│   └── scrapeCards.js        # Example scraper for card data
├── data/
│   └── cardsData.json        # JSON file with credit card information
├── styles/                   # Additional styles if any
├── utils/                    # Utility/helper functions
│   └── index.js
├── .gitignore
├── package.json
├── README.md
└── next.config.js            # Next.js configuration
```

### **Modifying Conversation Flow**
Update `app/api/chat/route.js` to customize:
- Question sequence
- Response patterns
- Data extraction logic
- Recommendation triggers

### **Styling Customization**
Tailwind CSS classes can be modified in components for:
- Color schemes (primary-600, accent-600)
- Layout adjustments
- Animation effects
- Responsive breakpoints

## 🌟 Advanced Features

### **Fallback System**
- Mock responses when AI service unavailable
- Graceful error handling
- Consistent user experience
- Automatic retry mechanisms

### **Performance Optimization**
- Lazy loading of components
- Efficient state management
- Minimal re-renders
- Optimized API calls

### **Accessibility**
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Semantic HTML structure

## 🔮 Future Enhancements

- **Voice Input/Output** - Speech recognition and synthesis
- **Multi-language Support** - Conversations in regional languages
- **Advanced Analytics** - User interaction tracking and insights
- **Bank Integration** - Real-time card availability and application links
- **Comparison Tools** - Side-by-side card comparisons
- **Credit Score Integration** - Personalized eligibility checking



