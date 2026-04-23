export interface BlogPost {
	slug: string;
	title: string;
	excerpt: string;
	category: string;
	date: string;
	readTime: string;
	coverEmoji: string;
	accentColor: string;
	content: string[];
}

export const blogPosts: BlogPost[] = [
	{
		slug: 'easy-diet-swaps',
		title: '5 Easy Swaps for a Healthier Diet',
		excerpt:
			'Small changes in your daily food choices can lead to big improvements in energy, mood, and long-term health. Here are five swaps anyone can make today.',
		category: 'Nutrition Tips',
		date: 'April 15, 2026',
		readTime: '4 min read',
		coverEmoji: '🥗',
		accentColor: 'bg-teal',
		content: [
			'Making big dietary changes overnight often leads to burnout. The secret to lasting healthy habits is incremental swaps — replacing one thing at a time until the healthier choice becomes automatic.',
			'**Swap 1: White rice → Brown or cauliflower rice.** Brown rice retains its bran layer, giving you more fiber, magnesium, and a lower glycaemic index. If you want to cut carbs entirely, cauliflower rice is a great low-calorie alternative that works in stir-fries and bowls.',
			'**Swap 2: Soda → Sparkling water with citrus.** A can of soda can contain up to 40g of sugar. Sparkling water with a squeeze of lime or a few slices of cucumber gives you the fizz without any of the sugar crash.',
			'**Swap 3: Deep-fried snacks → Air-popped popcorn or roasted chickpeas.** A bag of potato chips can be 500+ calories. Air-popped popcorn is a whole grain with only 30 calories per cup, and roasted chickpeas deliver plant protein with great crunch.',
			'**Swap 4: Creamy salad dressings → Olive oil and lemon.** Ranch and Caesar dressings pack in cream, sugar, and preservatives. A drizzle of good olive oil with fresh lemon juice tastes just as satisfying and comes with heart-healthy monounsaturated fats.',
			'**Swap 5: Candy or chocolate bars → Dark chocolate with almonds.** Dark chocolate (70%+) is rich in antioxidants and magnesium. Paired with almonds you also get healthy fats and protein that keep you satiated far longer than a sugar rush.',
			'Start with just one of these swaps this week. The goal is consistency over perfection — even one small change, repeated daily, compounds into real results over months.'
		]
	},
	{
		slug: 'understanding-macronutrients',
		title: 'Understanding Macronutrients: Protein, Carbs & Fats',
		excerpt:
			'Protein, carbohydrates, and fats are the three pillars of nutrition. Understanding what each does — and how much you need — is the foundation of healthy eating.',
		category: 'Education',
		date: 'April 10, 2026',
		readTime: '6 min read',
		coverEmoji: '🔬',
		accentColor: 'bg-purple',
		content: [
			'Macronutrients are nutrients your body needs in large amounts to function. Unlike vitamins and minerals (micronutrients), macros provide the energy — measured in calories — that powers everything from breathing to sprinting.',
			'**Protein** is the building block of muscle, organs, and enzymes. Each gram provides 4 calories. When you eat protein, your body breaks it down into amino acids, which are used to repair tissue, build muscle, and produce hormones. Good sources include chicken, fish, eggs, legumes, and tofu. Most adults benefit from around 0.8–1.2g per kilogram of body weight per day.',
			'**Carbohydrates** are your body\'s preferred energy source, also providing 4 calories per gram. They break down into glucose, which fuels your brain and muscles. The key is quality: complex carbs (oats, sweet potato, whole grains) digest slowly and provide sustained energy, while simple carbs (candy, white bread, soda) spike blood sugar and crash quickly.',
			'**Fats** are the most calorie-dense macro at 9 calories per gram, but they are essential for hormone production, brain function, and absorbing fat-soluble vitamins (A, D, E, K). Focus on unsaturated fats — olive oil, avocado, nuts, fatty fish — and limit saturated and trans fats.',
			'A common healthy ratio is roughly 50% carbs, 25% protein, 25% fats — but this varies hugely based on your goals, activity level, and metabolism. An endurance athlete needs more carbs; someone building muscle needs more protein.',
			'The biggest takeaway? No macronutrient is the enemy. Cutting carbs or fats entirely is rarely sustainable. Focus instead on the quality of each macro: whole food sources over processed ones.'
		]
	},
	{
		slug: 'hidden-sugar',
		title: 'Why Sugar is Sneaking Into Your Favourite Foods',
		excerpt:
			'Added sugar hides in places you would never expect — from bread and pasta sauce to salad dressings and flavoured yogurt. Learn to spot it on labels.',
		category: 'Label Reading',
		date: 'April 5, 2026',
		readTime: '5 min read',
		coverEmoji: '🍭',
		accentColor: 'bg-yellow',
		content: [
			'The average person consumes far more sugar than they realise — not from obvious sources like candy and cake, but from the dozens of processed foods that contain added sugars as flavour enhancers, preservatives, or to mask bitterness.',
			'Food manufacturers use over 60 different names for sugar on ingredient labels. Sucrose, glucose, fructose, maltose, dextrose, high-fructose corn syrup, agave nectar, barley malt, rice syrup — all of these are added sugars, regardless of how "natural" they sound.',
			'**Surprising places sugar hides:** Bread (especially sliced bread), pasta sauce (up to 12g per serving), flavoured yogurt (some contain more sugar than ice cream), granola bars, salad dressings, coleslaw, ketchup, sports drinks, and protein bars.',
			'The World Health Organization recommends keeping free (added) sugars below 10% of total daily energy intake — that is about 50g for the average adult, and ideally below 25g for additional health benefits.',
			'**How to read labels:** Look at the "Added Sugars" line on the nutrition facts panel (distinct from naturally occurring sugars in fruit or milk). Scan the ingredients list: the higher up a sugar name appears, the more of it there is. If there are 3-4 different sugar names, that is a red flag.',
			'The fix is not to eliminate sugar entirely — that is miserable and unnecessary. It is to be intentional. Cook more at home, choose plain yogurt and add your own fruit, and read labels on the things you buy regularly. Awareness is the most powerful tool.'
		]
	},
	{
		slug: 'meal-prep-tips',
		title: 'Meal Prep Tips for Busy People',
		excerpt:
			'You do not need to spend your whole Sunday in the kitchen. Smart meal prep is about strategic planning — a few hours of prep prevents a week of bad food decisions.',
		category: 'Lifestyle',
		date: 'March 28, 2026',
		readTime: '5 min read',
		coverEmoji: '🍱',
		accentColor: 'bg-teal',
		content: [
			'The biggest barrier to eating healthily is not willpower — it is friction. When you are hungry and tired at 7pm, you will always default to whatever requires the least effort. Meal prep removes that friction by doing the decision-making and cooking work in advance.',
			'**Start with your protein.** Protein takes the longest to cook and is the hardest to improvise when hungry. Grill or bake a large batch of chicken breasts, cook a pot of lentils, or hard-boil a dozen eggs. With protein ready, building a meal takes minutes.',
			'**Batch cook grains.** A big pot of brown rice, quinoa, or farro lasts 5 days in the fridge and forms the base of countless meals — grain bowls, stir-fries, soups, or sides. It takes 30 minutes of hands-off cooking time.',
			'**Pre-wash and chop vegetables.** Most of us skip vegetables not because we dislike them but because washing and chopping mid-week feels like a chore. Spending 20 minutes prepping veggies on Sunday means they are grab-and-go all week.',
			'**Invest in good containers.** Glass containers with lids keep food fresher longer than plastic. Clear containers mean you can see what you have at a glance, reducing the "I forgot about that" problem.',
			'**The 2-hour Sunday rule.** You do not need to prep every meal. Just prepping protein, a grain, and some vegetables gives you the components to assemble 15+ different meals without eating the same thing twice. Two hours on Sunday can fuel a week of healthy lunches and dinners.'
		]
	},
	{
		slug: 'comfort-food-cravings',
		title: 'The Science Behind Comfort Food Cravings',
		excerpt:
			'Why do we reach for pizza and ice cream when stressed? The answer is in your brain chemistry — and understanding it is the first step to taking back control.',
		category: 'Psychology',
		date: 'March 20, 2026',
		readTime: '6 min read',
		coverEmoji: '🧠',
		accentColor: 'bg-purple',
		content: [
			'Comfort food cravings are not a moral failing — they are a predictable neurochemical response. Understanding the biology helps you work with your brain rather than against it.',
			'When you are stressed, your body releases cortisol, the stress hormone. Cortisol signals your brain to seek high-calorie, high-fat, or high-sugar foods because, from an evolutionary perspective, stress meant physical danger and you needed energy reserves. Your brain did not evolve for the kind of stress that comes from a packed inbox.',
			'High-sugar and high-fat foods trigger the release of dopamine — the "reward" neurotransmitter. This creates a feedback loop: stress → craving → eating → temporary dopamine boost → brief relief → crash → more craving. It is the same loop behind many addiction patterns.',
			'**Serotonin** plays a big role too. About 90% of serotonin is produced in the gut. Carbohydrate-rich foods increase tryptophan availability in the brain, which converts to serotonin. This is partly why pasta and bread feel emotionally soothing.',
			'**Breaking the loop:** The goal is not to never eat comfort food — it is to separate the emotional cue from the automatic response. Techniques that help: a 10-minute pause before eating (often cravings pass), substituting the activity (a short walk triggers endorphins that serve a similar function), and keeping your comfort foods out of immediate reach so the barrier to eating them is slightly higher.',
			'Interestingly, research shows that after the initial stress response, many people report that a healthier food — like a handful of nuts or a piece of dark chocolate — provides similar emotional relief to chips or cookies. The craving is often less specific than it feels.'
		]
	},
	{
		slug: 'hydration-guide',
		title: 'Hydration: More Than Just Drinking Water',
		excerpt:
			'Dehydration affects your energy, focus, and mood before you ever feel thirsty. Discover how much water you actually need and the best ways to stay hydrated.',
		category: 'Wellness',
		date: 'March 12, 2026',
		readTime: '4 min read',
		coverEmoji: '💧',
		accentColor: 'bg-teal',
		content: [
			'By the time you feel thirsty, you are already mildly dehydrated. And even mild dehydration — as little as 1-2% fluid loss — measurably impairs cognitive performance, mood, and physical endurance.',
			'**How much do you need?** The old "8 glasses a day" is a rough heuristic, not science. A more reliable guide: about 35ml per kilogram of body weight. So a 70kg adult needs roughly 2.5 litres per day from all sources, including food. Active people, hot weather, and high-altitude environments all increase this.',
			'**Food counts.** Around 20% of daily fluid intake comes from food. Fruits and vegetables have very high water content: cucumber is 96% water, strawberries 91%, watermelon 92%. Eating a diet rich in whole fruits and vegetables meaningfully contributes to hydration.',
			'**Electrolytes matter.** Drinking water alone does not tell the whole story. Electrolytes — sodium, potassium, magnesium, chloride — regulate fluid balance in and around cells. After heavy exercise, sweating depletes these. A pinch of sea salt in water, a banana, or coconut water can help restore balance.',
			'**Signs of chronic mild dehydration:** Persistent headaches, afternoon energy slumps, difficulty concentrating, dark yellow urine, and dry skin. Many people attribute these symptoms to other causes without realising they are simply under-hydrated.',
			'**Practical habits:** Start every morning with a large glass of water before coffee. Keep a refillable bottle visible on your desk. Eat at least 2 portions of water-rich fruit or vegetables per day. And if you drink alcohol or caffeine, match each with an equivalent glass of water.'
		]
	}
];

export function getPost(slug: string): BlogPost | undefined {
	return blogPosts.find((p) => p.slug === slug);
}
