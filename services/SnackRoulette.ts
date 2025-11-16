// Snack Roulette - Shake to get healthy snack suggestions
// Replaces obesity-gaining foods with healthy alternatives

interface SnackSuggestion {
    name: string;
    emoji: string;
    calories: number;
    prepTime: string;
    healthBenefit: string;
    recipe: string;
    replacesUnhealthy: string;
    ingredients: string[];
}

class SnackRoulette {
    private static readonly snacks: SnackSuggestion[] = [
        {
            name: "Greek Yogurt Parfait",
            emoji: "🥛",
            calories: 180,
            prepTime: "2 min",
            healthBenefit: "High protein, probiotics for gut health",
            recipe: "Layer Greek yogurt with fresh berries and a drizzle of honey. Top with granola for crunch.",
            replacesUnhealthy: "Ice cream, sugary pudding",
            ingredients: ["1 cup Greek yogurt", "½ cup mixed berries", "1 tbsp honey", "2 tbsp granola"]
        },
        {
            name: "Apple Slices with Almond Butter",
            emoji: "🍎",
            calories: 195,
            prepTime: "1 min",
            healthBenefit: "Fiber + healthy fats = sustained energy",
            recipe: "Slice one apple and spread 2 tablespoons of almond butter. Sprinkle with cinnamon if desired.",
            replacesUnhealthy: "Cookies, candy bars",
            ingredients: ["1 medium apple", "2 tbsp almond butter", "Cinnamon (optional)"]
        },
        {
            name: "Veggie Sticks with Hummus",
            emoji: "🥕",
            calories: 150,
            prepTime: "3 min",
            healthBenefit: "Vitamins A, C, and plant-based protein",
            recipe: "Cut carrots, celery, and bell peppers into sticks. Serve with ¼ cup hummus for dipping.",
            replacesUnhealthy: "Chips, crackers",
            ingredients: ["2 carrots", "2 celery sticks", "½ bell pepper", "¼ cup hummus"]
        },
        {
            name: "Trail Mix Energy Bites",
            emoji: "🥜",
            calories: 210,
            prepTime: "5 min",
            healthBenefit: "Protein, omega-3s, natural energy boost",
            recipe: "Mix almonds, walnuts, dried cranberries, and dark chocolate chips. Portion into ¼ cup servings.",
            replacesUnhealthy: "Candy, processed snack bars",
            ingredients: ["¼ cup almonds", "¼ cup walnuts", "2 tbsp dried cranberries", "1 tbsp dark chocolate chips"]
        },
        {
            name: "Avocado Toast",
            emoji: "🥑",
            calories: 220,
            prepTime: "3 min",
            healthBenefit: "Healthy fats, fiber, keeps you full longer",
            recipe: "Toast whole grain bread. Mash ½ avocado on top. Season with salt, pepper, and red pepper flakes.",
            replacesUnhealthy: "Buttered toast, pastries",
            ingredients: ["1 slice whole grain bread", "½ avocado", "Salt & pepper", "Red pepper flakes"]
        },
        {
            name: "Banana Nice Cream",
            emoji: "🍌",
            calories: 120,
            prepTime: "2 min",
            healthBenefit: "No added sugar, potassium-rich, satisfies sweet cravings",
            recipe: "Blend 2 frozen bananas until smooth and creamy. Add cocoa powder or peanut butter for flavor.",
            replacesUnhealthy: "Ice cream, frozen desserts",
            ingredients: ["2 frozen bananas", "1 tbsp cocoa powder OR 1 tbsp peanut butter"]
        },
        {
            name: "Hard-Boiled Eggs with Everything Seasoning",
            emoji: "🥚",
            calories: 140,
            prepTime: "10 min (can prep ahead)",
            healthBenefit: "Complete protein, keeps hunger at bay",
            recipe: "Boil 2 eggs for 10 minutes. Peel and sprinkle with everything bagel seasoning.",
            replacesUnhealthy: "Fast food breakfast sandwiches",
            ingredients: ["2 eggs", "Everything bagel seasoning"]
        },
        {
            name: "Berry Smoothie Bowl",
            emoji: "🫐",
            calories: 230,
            prepTime: "5 min",
            healthBenefit: "Antioxidants, vitamins, natural sweetness",
            recipe: "Blend frozen berries with Greek yogurt and banana. Top with granola, chia seeds, and fresh fruit.",
            replacesUnhealthy: "Milkshakes, sugary smoothies",
            ingredients: ["1 cup frozen berries", "½ cup Greek yogurt", "½ banana", "Toppings: granola, chia seeds"]
        },
        {
            name: "Cucumber Boats with Tuna",
            emoji: "🥒",
            calories: 165,
            prepTime: "4 min",
            healthBenefit: "Lean protein, omega-3s, low-carb",
            recipe: "Halve cucumber lengthwise and scoop out seeds. Fill with tuna salad (tuna + Greek yogurt + lemon).",
            replacesUnhealthy: "Sandwiches on white bread",
            ingredients: ["1 cucumber", "1 can tuna", "2 tbsp Greek yogurt", "Lemon juice", "Salt & pepper"]
        },
        {
            name: "Chia Pudding",
            emoji: "🥄",
            calories: 180,
            prepTime: "5 min + overnight",
            healthBenefit: "Omega-3s, fiber, helps with digestion",
            recipe: "Mix 3 tbsp chia seeds with 1 cup almond milk. Refrigerate overnight. Top with berries and nuts.",
            replacesUnhealthy: "Pudding cups, desserts",
            ingredients: ["3 tbsp chia seeds", "1 cup almond milk", "Berries", "Nuts"]
        },
        {
            name: "Roasted Chickpeas",
            emoji: "🫘",
            calories: 200,
            prepTime: "30 min",
            healthBenefit: "Plant protein, fiber, crunchy satisfaction",
            recipe: "Toss chickpeas with olive oil and spices. Roast at 400°F for 25-30 min until crispy.",
            replacesUnhealthy: "Chips, fried snacks",
            ingredients: ["1 can chickpeas (drained)", "1 tbsp olive oil", "Paprika, garlic powder, salt"]
        },
        {
            name: "Cottage Cheese with Pineapple",
            emoji: "🍍",
            calories: 160,
            prepTime: "1 min",
            healthBenefit: "High protein, aids muscle recovery",
            recipe: "Top ½ cup cottage cheese with fresh pineapple chunks. Add a sprinkle of black pepper.",
            replacesUnhealthy: "Yogurt with high sugar content",
            ingredients: ["½ cup cottage cheese", "½ cup pineapple chunks", "Black pepper"]
        },
        {
            name: "Dark Chocolate & Almonds",
            emoji: "🍫",
            calories: 190,
            prepTime: "1 min",
            healthBenefit: "Antioxidants, satisfies chocolate cravings healthily",
            recipe: "Pair 2 squares (1 oz) of 70%+ dark chocolate with 10-12 almonds.",
            replacesUnhealthy: "Milk chocolate bars, candy",
            ingredients: ["1 oz dark chocolate (70%+)", "10-12 almonds"]
        },
        {
            name: "Zucchini Pizza Bites",
            emoji: "🍕",
            calories: 140,
            prepTime: "15 min",
            healthBenefit: "Low-carb pizza fix, packed with veggies",
            recipe: "Slice zucchini into rounds. Top with marinara, mozzarella, and pepperoni. Bake at 425°F for 10 min.",
            replacesUnhealthy: "Pizza, bread-based snacks",
            ingredients: ["1 zucchini", "¼ cup marinara", "¼ cup mozzarella", "Turkey pepperoni"]
        },
        {
            name: "Watermelon & Feta Salad",
            emoji: "🍉",
            calories: 135,
            prepTime: "3 min",
            healthBenefit: "Hydrating, sweet & savory combo, refreshing",
            recipe: "Cube watermelon and toss with crumbled feta, mint leaves, and a drizzle of balsamic glaze.",
            replacesUnhealthy: "Sugary fruit snacks, candy",
            ingredients: ["2 cups watermelon cubes", "¼ cup feta cheese", "Fresh mint", "Balsamic glaze"]
        },
        {
            name: "Sweet Potato Fries (Baked)",
            emoji: "🍠",
            calories: 160,
            prepTime: "25 min",
            healthBenefit: "Vitamin A, fiber, healthier than regular fries",
            recipe: "Cut sweet potato into fries. Toss with olive oil and paprika. Bake at 425°F for 20-25 min.",
            replacesUnhealthy: "French fries, potato chips",
            ingredients: ["1 medium sweet potato", "1 tbsp olive oil", "Paprika", "Salt"]
        },
        {
            name: "Protein Energy Balls",
            emoji: "⚡",
            calories: 185,
            prepTime: "10 min",
            healthBenefit: "Pre/post workout fuel, no bake, portable",
            recipe: "Mix oats, peanut butter, honey, and protein powder. Roll into balls. Refrigerate 30 min.",
            replacesUnhealthy: "Granola bars, protein bars with added sugar",
            ingredients: ["1 cup oats", "½ cup peanut butter", "⅓ cup honey", "¼ cup protein powder"]
        },
        {
            name: "Caprese Skewers",
            emoji: "🍅",
            calories: 145,
            prepTime: "5 min",
            healthBenefit: "Protein, healthy fats, vitamin-rich",
            recipe: "Thread cherry tomatoes, mozzarella balls, and basil on skewers. Drizzle with balsamic glaze.",
            replacesUnhealthy: "Cheese and crackers",
            ingredients: ["10 cherry tomatoes", "10 mozzarella balls", "Fresh basil", "Balsamic glaze"]
        },
        {
            name: "Edamame with Sea Salt",
            emoji: "🫛",
            calories: 120,
            prepTime: "5 min",
            healthBenefit: "Plant protein, fun to eat, filling",
            recipe: "Steam or microwave edamame pods for 5 minutes. Sprinkle generously with sea salt.",
            replacesUnhealthy: "Popcorn, pretzels",
            ingredients: ["1 cup edamame pods", "Sea salt"]
        },
        {
            name: "Overnight Oats",
            emoji: "🥣",
            calories: 240,
            prepTime: "5 min + overnight",
            healthBenefit: "Slow-release energy, heart-healthy",
            recipe: "Mix oats, almond milk, chia seeds, and honey. Refrigerate overnight. Top with berries in morning.",
            replacesUnhealthy: "Sugary cereal, donuts",
            ingredients: ["½ cup oats", "½ cup almond milk", "1 tbsp chia seeds", "1 tsp honey", "Berries"]
        }
    ];

    static getRandomSnack(): SnackSuggestion {
        const randomIndex = Math.floor(Math.random() * this.snacks.length);
        return this.snacks[randomIndex];
    }

    static getCalorieColor(calories: number): string {
        if (calories <= 150) return '#10B981'; // Green - low cal
        if (calories <= 200) return '#FBBF24'; // Yellow - moderate
        return '#F59E0B'; // Orange - higher cal (but still healthy!)
    }
}

export default SnackRoulette;
