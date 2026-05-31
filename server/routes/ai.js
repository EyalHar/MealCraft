const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST suggest recipes based on meal planner input
router.post('/suggest-recipes', async (req, res) => {
  try {
    const { guestCount, style, ingredients, availableTime, maxDifficulty, freeText, existingRecipeNames } = req.body;

    const difficultyLabels = { 1: 'קל מאוד', 2: 'קל', 3: 'בינוני', 4: 'קשה', 5: 'מאוד קשה' };

    const prompt = `אתה שף מומחה לבישול כשר ומסורתי. הצע 5 מתכונים כשרים המתאימים לארוחה משפחתית חגיגית עם הפרטים הבאים:
- מספר סועדים: ${guestCount}
- סגנון בישול: ${style || 'כל סגנון'}
- מרכיבים עיקריים: ${ingredients?.length ? ingredients.join(', ') : 'כל מרכיב'}
- זמן הכנה זמין: ${availableTime ? `${availableTime} דקות` : 'ללא הגבלה'}
- רמת קושי מקסימלית: ${maxDifficulty ? difficultyLabels[maxDifficulty] : 'כל רמה'}
- הכיוון הרצוי: ${freeText || 'ללא'}
- מתכונים שכבר קיימים (אין לחזור עליהם): ${existingRecipeNames?.length ? existingRecipeNames.join(', ') : 'אין'}

החזר תשובה בפורמט JSON בלבד, ללא טקסט נוסף, עם המבנה הבא:
{
  "recipes": [
    {
      "name": "שם המתכון",
      "style": "אחד מ: אשכנזי/ספרדי/מזרחי/ים תיכוני/אסייתי/אמריקאי/מודרני/אחר",
      "category": "אחד מ: מנה ראשונה/מרק/סלט/מנה עיקרית/תוספת/קינוח/מאפה/שתייה",
      "kosherType": "אחד מ: בשרי/חלבי/פרווה",
      "servings": מספר,
      "prepTime": דקות,
      "cookTime": דקות,
      "difficulty": מספר 1-5,
      "ingredients": [{"name": "שם", "amount": "כמות", "unit": "יחידה"}],
      "instructions": "הוראות הכנה מפורטות",
      "tools": ["כלי1", "כלי2"],
      "tags": ["תגית1", "תגית2"],
      "notes": "הערות והמלצות"
    }
  ]
}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonText = text.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
    const parsed = JSON.parse(jsonText);

    // Mark all AI suggestions as having no image (copyright rule)
    parsed.recipes = parsed.recipes.map((r) => ({ ...r, images: [], source: 'ai' }));

    res.json(parsed);
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ message: 'שגיאה בקבלת הצעות מה-AI', error: err.message });
  }
});

module.exports = router;
