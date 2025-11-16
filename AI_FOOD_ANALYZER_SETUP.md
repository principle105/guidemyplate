# AI Food Photo Analyzer Setup

## Free AI API Options

We've implemented the AI Food Analyzer with mock data, but you can connect it to a real AI service! Here are the best **FREE** options:

### Option 1: Clarifai (Recommended) ⭐
- **Free Tier**: 5,000 operations/month
- **Best for**: Food recognition
- **Sign up**: https://www.clarifai.com/
- **Steps**:
  1. Create free account
  2. Go to https://portal.clarifai.com/settings/security
  3. Create a Personal Access Token (PAT)
  4. Copy your API key
  5. Add to `/services/AIFoodAnalyzer.ts`:
     ```typescript
     private static readonly CLARIFAI_API_KEY = 'YOUR_API_KEY_HERE';
     ```

### Option 2: Google Cloud Vision API
- **Free Tier**: 1,000 requests/month
- **Best for**: General food detection
- **Sign up**: https://cloud.google.com/vision/
- **Requires**: Credit card (but won't charge for free tier)

### Option 3: Hugging Face (100% Free)
- **Free Tier**: Unlimited for small models
- **Best for**: Open source food classification
- **Sign up**: https://huggingface.co/
- **No credit card required!**

## Current Implementation

The app currently uses **mock data** to demonstrate the feature without requiring an API key. This is perfect for:
- ✅ Hackathon demos
- ✅ Testing the UI/UX
- ✅ Showing the concept
- ✅ No setup required!

## How It Works (Mock Mode)

1. User takes/selects photo
2. Shows "analyzing" animation (2 seconds)
3. Returns randomized realistic food analysis:
   - Detected foods
   - Health score (0-100)
   - Nutrition breakdown
   - Smart improvement suggestions
   - Estimated calories

## Connecting Real AI

To connect Clarifai:

1. **Get API Key** from Clarifai
2. **Update AIFoodAnalyzer.ts**:
```typescript
static async analyzeFood(imageUri: string) {
    try {
        // Real API call
        const response = await fetch('https://api.clarifai.com/v2/models/food-item-recognition/outputs', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${this.CLARIFAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: [{
                    data: {
                        image: {
                            url: imageUri
                        }
                    }
                }]
            })
        });

        const data = await response.json();
        return this.processClairifaiResponse(data);
    } catch (error) {
        console.error('Error analyzing food:', error);
        return this.getMockFoodAnalysis(); // Fallback to mock
    }
}
```

3. **Add response processor**:
```typescript
private static processClairifaiResponse(data: any) {
    const concepts = data.outputs[0].data.concepts;
    const detectedFoods = concepts.slice(0, 3).map((c: any) => c.name);
    
    // Calculate health score based on detected foods
    const healthScore = this.calculateHealthScore(detectedFoods);
    
    return {
        detectedFoods,
        healthScore,
        // ... rest of the analysis
    };
}
```

## For Hackathon Demo

✅ **No changes needed!** The mock data works perfectly for demos and shows the full feature concept.

## Future Enhancements

- [ ] Real-time food detection
- [ ] Barcode scanning
- [ ] Nutrition database integration
- [ ] Meal history tracking
- [ ] Weekly trends analysis

---

**Note**: Mock data provides realistic examples without API setup, perfect for hackathons and prototyping!
