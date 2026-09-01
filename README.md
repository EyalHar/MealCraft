# MealCraft

MealCraft הוא אפליקציית ווב לניהול ותכנון ארוחות משפחתיות כשרות. האפליקציה מאפשרת לנהל ספריית מתכונים אישית (כולל סגנון מטבח, סוג כשרות, רמת קושי וזמני הכנה), לתכנן ארוחה שלמה לפי מספר סועדים וזמן פנוי — עם הצעת מתכונים מבוססת AI (Gemini) שמתאימה את עצמה לאילוצים שהוגדרו — וליצור אוטומטית רשימת קניות המחושבת לפי כמות הסועדים, יחד עם מעקב אחר התקדמות ההכנה של כל מתכון בארוחה.

## Tech Stack

- **Frontend:** React 19 (Vite), React Router, Tailwind CSS, axios, react-hot-toast, lucide-react
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Image storage:** Cloudinary (דרך multer-storage-cloudinary)
- **AI:** Google Gemini (`@google/generative-ai`) להצעת מתכונים

## תכונות עיקריות

- **ניהול מתכונים** (`/recipes`) — יצירה, עריכה ומחיקה של מתכונים עם רכיבים, הוראות הכנה, רמת קושי, זמן הכנה/בישול, מספר מנות, סגנון מטבח (אשכנזי/ספרדי/מזרחי/ים תיכוני/אסייתי/אמריקאי/מודרני), סוג כשרות (בשרי/חלבי/פרווה), דירוג, תגיות, הערות ומספר פעמים שהמתכון בושל בפועל.
- **העלאת תמונות** למתכונים דרך Cloudinary (רק תמונות שהעלה המשתמש, לא תמונות AI, מטעמי זכויות יוצרים).
- **חיפוש וסינון** מתכונים לפי סגנון, קטגוריה, סוג כשרות, רמת קושי וטקסט חופשי (אינדקס טקסט על שם/תגיות/רכיבים), עם מיון לפי דירוג, פופולריות או קושי.
- **תכנון ארוחה** (`/planner`) — הגדרת ארוחה לפי מספר סועדים, סגנון, רכיבים רצויים, זמן זמין ורמת קושי מקסימלית, עם חיפוש מתכונים קיימים לפי התאמת רכיבים וניקוד, וכן קבלת **הצעות מתכונים חדשים מבוססות AI** (Gemini) בהתאם לאילוצים שהוגדרו.
- **רשימת קניות אוטומטית** (`/shopping`) — יצירת רשימת קניות ממתכוני הארוחה, עם חישוב כמויות שמותאם אוטומטית למספר הסועדים, וסימון פריטים שנקנו.
- **מעקב הכנת ארוחה** (`/preparation`) — מעקב אחר סטטוס ההכנה של כל מתכון בארוחה (ממתין / בתהליך / הושלם), עם עדכון אוטומטי של מונה הפעמים שהמתכון בושל בפועל.

## התקנה

הפרויקט מחולק ל-`client` (React) ו-`server` (Express), עם `package.json` נוסף בשורש שמריץ את שניהם יחד.

```bash
git clone https://github.com/EyalHar/MealCraft.git
cd MealCraft
npm run install:all
```

הפקודה `install:all` מתקינה את התלויות גם ב-`server` וגם ב-`client`.

### משתני סביבה

יש ליצור קובץ `.env` בתוך תיקיית `server` (לפי הדוגמה ב-`server/.env.example`):

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/mealcraft
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

- `MONGODB_URI` — חיבור למסד נתונים MongoDB (למשל MongoDB Atlas).
- `CLOUDINARY_*` — פרטי חשבון Cloudinary לאחסון תמונות מתכונים.
- `GEMINI_API_KEY` — מפתח API של Google Gemini עבור הצעות המתכונים ב-AI.
- `PORT` — פורט השרת (ברירת מחדל: `5000`).

## הרצה

מריצים משורש הפרויקט:

```bash
npm run dev
```

זה מפעיל את שרת ה-Express (`npm run server`, על בסיס `nodemon`) ואת שרת הפיתוח של Vite עבור ה-client (`npm run client`) יחד.

ניתן גם להריץ כל צד בנפרד:

```bash
# שרת בלבד (בתיקיית server)
npm run dev      # nodemon server.js
npm start        # node server.js

# קליינט בלבד (בתיקיית client)
npm run dev       # vite dev server
npm run build      # build לפרודקשן
npm run preview    # תצוגה מקדימה של ה-build
npm run lint       # בדיקת ESLint
```

## מבנה הפרויקט

```
MealCraft/
├── package.json          # סקריפטים כלליים להרצת client+server יחד
├── client/                # אפליקציית React (Vite)
│   └── src/
│       ├── api/           # שכבת תקשורת מול ה-API (axios)
│       ├── components/    # רכיבים משותפים (RecipeCard, RecipeForm, Navbar וכו')
│       └── pages/          # RecipesPage, MealPlannerPage, ShoppingPage, PreparationPage
└── server/                 # שרת Express
    ├── config/              # חיבור ל-MongoDB ול-Cloudinary
    ├── models/              # Recipe, Meal, ShoppingList (Mongoose)
    ├── routes/               # recipes, meals, shopping, ai
    └── server.js              # נקודת הכניסה של השרת
```
