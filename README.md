# MealCraft

MealCraft is a web app for planning and managing kosher family meals. You keep a personal recipe library (cuisine style, kosher type, difficulty, prep/cook time), plan a full meal around how many people you're feeding and how much time you have — with AI-generated recipe suggestions (Gemini) that adapt to whatever constraints you set — and get a shopping list built automatically from the recipes, scaled to the number of people and with progress tracking for how far along each recipe is.

## Tech Stack

- **Frontend:** React 19 (Vite), React Router, Tailwind CSS, axios, react-hot-toast, lucide-react
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Image storage:** Cloudinary (via multer-storage-cloudinary)
- **AI:** Google Gemini (`@google/generative-ai`) for recipe suggestions

## Features

- **Recipe management** (`/recipes`) — create, edit and delete recipes with ingredients, instructions, difficulty, prep/cook time, servings, cuisine style (Ashkenazi/Sephardic/Mizrahi/Mediterranean/Asian/American/modern), kosher type (meat/dairy/pareve), rating, tags, notes, and a counter for how many times you've actually cooked it.
- **Recipe photos** via Cloudinary — only images you upload yourself, no AI-generated images, to stay on the right side of copyright.
- **Search and filtering** by style, category, kosher type, difficulty, and free text (text index on name/tags/ingredients), sortable by rating, popularity or difficulty.
- **Meal planning** (`/planner`) — set up a meal by number of people, style, desired ingredients, available time and max difficulty, then either match it against your existing recipes (scored by ingredient fit) or get **new AI-generated recipe suggestions** (Gemini) built around those same constraints.
- **Automatic shopping list** (`/shopping`) — builds a shopping list from a meal's recipes, scales quantities to the number of people, and lets you check items off as you buy them.
- **Meal prep tracking** (`/preparation`) — tracks the status of each recipe in a meal (pending / in progress / done), and automatically bumps the "times cooked" counter when a recipe is finished.

## Setup

The project is split into `client` (React) and `server` (Express), with a top-level `package.json` that runs both together.

```bash
git clone https://github.com/EyalHar/MealCraft.git
cd MealCraft
npm run install:all
```

`install:all` installs dependencies in both `server` and `client`.

### Environment variables

Create a `.env` file inside `server` (see `server/.env.example` for reference):

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/mealcraft
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

- `MONGODB_URI` — your MongoDB connection string (e.g. MongoDB Atlas).
- `CLOUDINARY_*` — Cloudinary account details for storing recipe images.
- `GEMINI_API_KEY` — Google Gemini API key, used for the AI recipe suggestions.
- `PORT` — server port (defaults to `5000`).

## Running it

From the project root:

```bash
npm run dev
```

This starts the Express server (`npm run server`, via `nodemon`) and the Vite dev server for the client (`npm run client`) together.

You can also run each side on its own:

```bash
# server only (from the server directory)
npm run dev      # nodemon server.js
npm start        # node server.js

# client only (from the client directory)
npm run dev       # vite dev server
npm run build      # production build
npm run preview    # preview the build
npm run lint       # run ESLint
```

## Project structure

```
MealCraft/
├── package.json          # top-level scripts for running client+server together
├── client/                # React app (Vite)
│   └── src/
│       ├── api/           # API layer (axios)
│       ├── components/    # shared components (RecipeCard, RecipeForm, Navbar, etc.)
│       └── pages/          # RecipesPage, MealPlannerPage, ShoppingPage, PreparationPage
└── server/                 # Express server
    ├── config/              # MongoDB and Cloudinary setup
    ├── models/              # Recipe, Meal, ShoppingList (Mongoose)
    ├── routes/               # recipes, meals, shopping, ai
    └── server.js              # server entry point
```
