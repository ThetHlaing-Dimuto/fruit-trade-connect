# FruitTrade Connect

A modern, AI-powered business intelligence dashboard and trading platform for global fruit suppliers and buyers.

## 🚀 Features
- **Supplier & Buyer Directory:** Add, browse, and manage fruit suppliers and buyers.
- **AI Trade Assistant:** Chatbot for smart suggestions, compliance checks, and onboarding help.
- **Business Intelligence Dashboard:** Visualizes market trends, price predictions, and actionable insights.
- **Price Predictions:** Live and AI-powered price/cost forecasts for fruits.
- **Buyer-Supplier Connection Map:** Sankey diagram visualizing potential trading relationships.
- **Step-by-step Tutorial:** Onboarding modal guides users through the main features.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Recharts, D3
- **Backend:** Node.js, Express (see `vertex-express-server.cjs`)
- **AI/ML:** Google Vertex AI (for insights and explanations)

## 🧑‍💻 Local Development
1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd FruitTradeConnect
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the root with:
     ```env
     VITE_API_BASE_URL=http://localhost:3001
     FRONTEND_BASE_URL=http://localhost:5173
     ```
   - (Optional) Add any API keys or secrets as needed.
4. **Start the backend:**
   ```bash
   node vertex-express-server.cjs
   ```
5. **Start the frontend:**
   ```bash
   npm run dev
   ```
6. **Open in browser:**
   Visit [http://localhost:5173](http://localhost:5173)

## 🌐 Free Hosting & Deployment
You can host this app for free using:
- **Frontend:** [Vercel](https://vercel.com), [Netlify](https://netlify.com), [Render](https://render.com), [Railway](https://railway.app)
- **Backend:** [Render](https://render.com), [Railway](https://railway.app)

**Steps:**
1. Push your code to GitHub.
2. Deploy the frontend (Vite) to Vercel/Netlify/Render.
3. Deploy the backend (Express) to Render/Railway.
4. Set the frontend's `VITE_API_BASE_URL` to your backend's deployed URL.
5. Set the backend's CORS and allowed origins as needed.

## 📄 Environment Setup

- You must create a `.env` file in the project root with the following four variables:

```env
VITE_API_BASE_URL=http://localhost:3001                # URL of your backend API
FRONTEND_BASE_URL=http://localhost:5173                # URL of your frontend (for CORS)
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id      # Google Cloud project ID for Vertex AI
GOOGLE_APPLICATION_CREDENTIALS=google-service-account.json # Path to your Google service account JSON file
```

- These are required for the frontend to communicate with the backend, for proper CORS configuration, and for enabling Google Vertex AI features in the backend.
- Update the values as needed for your deployment.

## 📁 Project Structure
```
FruitTradeConnect/
  src/
    components/      # React components (Directory, Chatbot, Detail pages, Sankey, etc.)
    data/            # Mock data
    hooks/           # Custom hooks
    pages/api/       # API endpoints (Vertex AI, etc.)
    types/           # TypeScript types
    utils/           # Utility functions
  vertex-express-server.cjs  # Express backend
  index.html, package.json, vite.config.ts, ...
```

## 📝 License
MIT (or your preferred license)

---

**Questions or need help?** Open an issue or ask your AI assistant in the app! 