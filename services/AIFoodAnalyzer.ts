// AI Food Analysis Service using Clarifai API
// Free tier: 5,000 operations/month

class AIFoodAnalyzer {
    private static readonly CLARIFAI_PAT = '81b3300060564ddd90aac4b27d03b01d';
    private static readonly CLARIFAI_USER_ID = 'jacobtituana';
    private static readonly CLARIFAI_APP_ID = 'Guidemyplate';
    private static readonly MODEL_ID = 'food-item-recognition';
    private static readonly MODEL_VERSION_ID = '1d5fd481e0cf4826aa72ec3ff049e044';

    static async analyzeFood(imageUri: string) {
        try {
            // Convert image to base64
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const base64 = await this.blobToBase64(blob);
            const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix

            // Call Clarifai API - using public food model
            const apiResponse = await fetch(
                'https://api.clarifai.com/v2/models/food-item-recognition/outputs',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Key ${this.CLARIFAI_PAT}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_app_id: {
                            user_id: 'clarifai',
                            app_id: 'main'
                        },
                        inputs: [
                            {
                                data: {
                                    image: {
                                        base64: base64Data
                                    }
                                }
                            }
                        ]
                    })
                }
            );

            const result = await apiResponse.json();
            
            console.log('=== CLARIFAI API RESPONSE ===');
            console.log('Status:', apiResponse.status);
            console.log('Response:', JSON.stringify(result, null, 2));
            
            // Check for errors
            if (result.status && result.status.code !== 10000) {
                console.error('API Error:', result.status.description);
                console.error('Full error details:', JSON.stringify(result.status, null, 2));
                return this.getMockFoodAnalysis();
            }
            
            if (result.outputs && result.outputs[0]?.data?.concepts) {
                console.log('✅ Detected foods:', result.outputs[0].data.concepts.slice(0, 5).map((c: any) => `${c.name} (${(c.value * 100).toFixed(1)}%)`));
                return this.processAPIResponse(result.outputs[0].data.concepts);
            }
            
            // Fallback to mock data if API fails
            console.log('⚠️ API returned no results, using mock data');
            return this.getMockFoodAnalysis();
        } catch (error: any) {
            console.error('❌ Error analyzing food:', error.message);
            console.error('Full error:', error);
            // Return mock data as fallback
            return this.getMockFoodAnalysis();
        }
    }

    private static blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    private static processAPIResponse(concepts: any[]) {
        // Get top detected foods (confidence > 0.8)
        const detectedFoods = concepts
            .filter(c => c.value > 0.8)
            .slice(0, 3)
            .map(c => c.name);

        if (detectedFoods.length === 0) {
            detectedFoods.push(concepts[0]?.name || 'Unknown food');
        }

        // Calculate health score based on food types
        const healthScore = this.calculateHealthScore(detectedFoods);
        
        // Generate improvements
        const improvements = this.generateImprovements(detectedFoods, healthScore);
        
        // Estimate calories (rough estimate)
        const calories = this.estimateCalories(detectedFoods);

        return {
            detectedFoods,
            healthScore,
            calories,
            improvements,
            improvedScore: Math.min(100, healthScore + improvements.reduce((sum, imp) => {
                const points = parseInt(imp.impact.match(/\d+/)?.[0] || '0');
                return sum + points;
            }, 0)),
            nutritionBreakdown: this.estimateNutrition(detectedFoods)
        };
    }

    private static calculateHealthScore(foods: string[]): number {
        let score = 60; // Base score
        
        const healthyKeywords = ['fruit', 'vegetable', 'salad', 'grain', 'fish', 'chicken', 'water', 'tea'];
        const unhealthyKeywords = ['pizza', 'burger', 'fries', 'soda', 'cake', 'candy', 'donut', 'ice cream'];
        
        foods.forEach(food => {
            const lowerFood = food.toLowerCase();
            if (healthyKeywords.some(kw => lowerFood.includes(kw))) {
                score += 15;
            }
            if (unhealthyKeywords.some(kw => lowerFood.includes(kw))) {
                score -= 20;
            }
        });
        
        return Math.max(20, Math.min(100, score));
    }

    private static generateImprovements(foods: string[], currentScore: number): any[] {
        const improvements = [];
        const foodStr = foods.join(' ').toLowerCase();
        
        // Drink replacements
        if (foodStr.includes('soda') || foodStr.includes('cola') || foodStr.includes('pepsi')) {
            improvements.push({ icon: '💧', text: 'Swap soda → sparkling water with lemon', impact: '+25 points' });
        } else if (foodStr.includes('juice') || foodStr.includes('smoothie')) {
            improvements.push({ icon: '🍊', text: 'Replace juice → whole fruit for fiber', impact: '+15 points' });
        } else if (foodStr.includes('milkshake') || foodStr.includes('frappe')) {
            improvements.push({ icon: '☕', text: 'Switch to unsweetened iced coffee', impact: '+20 points' });
        }
        
        // Fried food replacements
        if (foodStr.includes('fries') || foodStr.includes('french fries')) {
            improvements.push({ icon: '🥗', text: 'Replace fries → roasted sweet potato', impact: '+20 points' });
        } else if (foodStr.includes('chips') || foodStr.includes('crisps')) {
            improvements.push({ icon: '🥕', text: 'Swap chips → carrot sticks with hummus', impact: '+18 points' });
        } else if (foodStr.includes('fried') || foodStr.includes('tempura')) {
            improvements.push({ icon: '🍗', text: 'Choose grilled or baked instead', impact: '+15 points' });
        }
        
        // Main dish improvements
        if (foodStr.includes('burger') || foodStr.includes('hamburger')) {
            improvements.push({ icon: '🥙', text: 'Try turkey burger on whole wheat bun', impact: '+15 points' });
        } else if (foodStr.includes('pizza')) {
            improvements.push({ icon: '🍕', text: 'Order thin crust with veggie toppings', impact: '+12 points' });
        } else if (foodStr.includes('hot dog') || foodStr.includes('hotdog')) {
            improvements.push({ icon: '🌭', text: 'Switch to grilled chicken sausage', impact: '+15 points' });
        } else if (foodStr.includes('bacon')) {
            improvements.push({ icon: '🥓', text: 'Replace bacon → turkey bacon or avocado', impact: '+10 points' });
        } else if (foodStr.includes('steak') || foodStr.includes('beef')) {
            improvements.push({ icon: '🐟', text: 'Try salmon or grilled chicken', impact: '+12 points' });
        }
        
        // Dessert/snack replacements
        if (foodStr.includes('cake') || foodStr.includes('cupcake')) {
            improvements.push({ icon: '🍓', text: 'Swap cake → Greek yogurt with berries', impact: '+20 points' });
        } else if (foodStr.includes('cookie') || foodStr.includes('brownie')) {
            improvements.push({ icon: '🍎', text: 'Try apple slices with almond butter', impact: '+15 points' });
        } else if (foodStr.includes('ice cream') || foodStr.includes('gelato')) {
            improvements.push({ icon: '🍌', text: 'Make frozen banana "nice cream"', impact: '+18 points' });
        } else if (foodStr.includes('candy') || foodStr.includes('chocolate')) {
            improvements.push({ icon: '🍫', text: 'Choose 70%+ dark chocolate (1-2 squares)', impact: '+10 points' });
        } else if (foodStr.includes('donut') || foodStr.includes('doughnut')) {
            improvements.push({ icon: '🥐', text: 'Switch to whole grain muffin with fruit', impact: '+15 points' });
        }
        
        // Healthy foods - still give optimization tips
        if (foodStr.includes('fruit') || foodStr.includes('apple') || foodStr.includes('banana') || foodStr.includes('kiwi')) {
            improvements.push({ icon: '🥜', text: 'Add protein: pair with nuts or yogurt', impact: '+10 points' });
        }
        
        if (foodStr.includes('salad')) {
            improvements.push({ icon: '🥑', text: 'Boost nutrients: add avocado & seeds', impact: '+8 points' });
        }
        
        // Add portion control for high-calorie items
        if (foodStr.includes('pasta') || foodStr.includes('rice') || foodStr.includes('noodle')) {
            improvements.push({ icon: '🍝', text: 'Use smaller plate & fill half with veggies', impact: '+12 points' });
        }
        
        // If no specific improvements, give general healthy additions
        if (improvements.length === 0) {
            improvements.push({ icon: '🥦', text: 'Add a side of steamed vegetables', impact: '+15 points' });
            improvements.push({ icon: '💧', text: 'Drink water before and during meal', impact: '+10 points' });
            improvements.push({ icon: '🥗', text: 'Start meal with a small side salad', impact: '+12 points' });
        }
        
        // Limit to top 3 most impactful suggestions
        return improvements.slice(0, 3);
    }

    private static estimateCalories(foods: string[]): number {
        // Rough calorie estimates
        let calories = 400; // Base estimate
        
        const foodStr = foods.join(' ').toLowerCase();
        if (foodStr.includes('burger') || foodStr.includes('pizza')) calories += 400;
        if (foodStr.includes('fries')) calories += 300;
        if (foodStr.includes('salad')) calories -= 100;
        if (foodStr.includes('fruit')) calories -= 150;
        
        return Math.max(100, calories);
    }

    private static estimateNutrition(foods: string[]): any {
        const foodStr = foods.join(' ').toLowerCase();
        
        return {
            protein: foodStr.includes('meat') || foodStr.includes('chicken') || foodStr.includes('fish') ? 'Good' : 'Low',
            fiber: foodStr.includes('fruit') || foodStr.includes('vegetable') || foodStr.includes('grain') ? 'Good' : 'Low',
            sodium: foodStr.includes('pizza') || foodStr.includes('burger') || foodStr.includes('fries') ? 'Very High' : 'Moderate',
            sugar: foodStr.includes('soda') || foodStr.includes('dessert') || foodStr.includes('cake') ? 'Very High' : 'Moderate'
        };
    }

    private static getMockFoodAnalysis() {
        // Simulated AI response for demo purposes
        const analyses = [
            {
                detectedFoods: ['Pizza', 'Soda'],
                healthScore: 45,
                calories: 850,
                improvements: [
                    { icon: '💧', text: 'Swap soda → water', impact: '+20 points' },
                    { icon: '🥗', text: 'Add side salad', impact: '+15 points' },
                    { icon: '🍕', text: 'Switch to thin crust', impact: '+10 points' }
                ],
                improvedScore: 90,
                nutritionBreakdown: {
                    protein: 'Low',
                    fiber: 'Very Low',
                    sodium: 'Very High',
                    sugar: 'High'
                }
            },
            {
                detectedFoods: ['Burger', 'Fries', 'Milkshake'],
                healthScore: 35,
                calories: 1200,
                improvements: [
                    { icon: '🥤', text: 'Swap milkshake → water', impact: '+25 points' },
                    { icon: '🍟', text: 'Replace fries → side salad', impact: '+20 points' },
                    { icon: '🍔', text: 'Choose grilled chicken burger', impact: '+15 points' }
                ],
                improvedScore: 95,
                nutritionBreakdown: {
                    protein: 'Moderate',
                    fiber: 'Very Low',
                    sodium: 'Very High',
                    sugar: 'Very High'
                }
            },
            {
                detectedFoods: ['Pasta', 'Garlic Bread', 'Cream Sauce'],
                healthScore: 50,
                calories: 950,
                improvements: [
                    { icon: '🍝', text: 'Use whole wheat pasta', impact: '+15 points' },
                    { icon: '🥦', text: 'Add vegetables to pasta', impact: '+20 points' },
                    { icon: '🧈', text: 'Reduce cream sauce by half', impact: '+15 points' }
                ],
                improvedScore: 100,
                nutritionBreakdown: {
                    protein: 'Low',
                    fiber: 'Low',
                    sodium: 'High',
                    sugar: 'Moderate'
                }
            }
        ];

        return analyses[Math.floor(Math.random() * analyses.length)];
    }

    static getHealthScoreColor(score: number): string {
        if (score >= 80) return '#10B981'; // Green
        if (score >= 60) return '#F59E0B'; // Yellow
        return '#EF4444'; // Red
    }

    static getHealthScoreLabel(score: number): string {
        if (score >= 80) return 'Great Choice!';
        if (score >= 60) return 'Could Be Better';
        return 'Needs Improvement';
    }

    static getNutritionColor(level: string): string {
        const colors: { [key: string]: string } = {
            'Very Low': '#EF4444',
            'Low': '#F59E0B',
            'Moderate': '#10B981',
            'Good': '#10B981',
            'High': '#F59E0B',
            'Very High': '#EF4444'
        };
        return colors[level] || '#9CA3AF';
    }
}

export default AIFoodAnalyzer;
