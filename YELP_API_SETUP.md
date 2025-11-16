# Yelp API Setup (Optional)

The restaurant finder works with **mock data** by default, so you can test it immediately!

## To use real restaurant data:

1. Go to https://www.yelp.com/developers
2. Create a free account
3. Create a new app
4. Copy your API Key
5. Open `app/restaurant-finder.tsx`
6. Replace line 130: `const YELP_API_KEY = "YOUR_YELP_API_KEY_HERE";` with your actual key

## Current Features (Working Now):

✅ Location permission request
✅ Mock restaurant data (5 nearby restaurants)
✅ Health scoring algorithm
✅ 10 pre-loaded chain strategies (Chipotle, Subway, McDonald's, etc.)
✅ Navigate button (opens Apple Maps)
✅ Check-in tracking

## Demo Tips:

- The mock data includes: Chipotle (85 score), Sweetgreen (95 score), McDonald's (40 score), Panera (75 score), Local Pizza (35 score)
- All features work without Yelp API
- For demo, you can show: "I'm eating out" → Location permission → See healthy options → View strategy → Navigate
