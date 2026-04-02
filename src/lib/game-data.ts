export interface FoodCard {
	name: string;
	emoji: string;
	calories: number;
	description: string;
	isHealthier?: boolean;
}

export interface Round {
	optionA: FoodCard;
	optionB: FoodCard;
	explanation: string;
}

export const rounds: Round[] = [
	{
		optionA: {
			name: 'Grilled Chicken Salad',
			emoji: '🥗',
			calories: 350,
			description: 'Mixed greens, grilled chicken breast, olive oil dressing',
			isHealthier: true
		},
		optionB: {
			name: 'Double Cheeseburger',
			emoji: '🍔',
			calories: 740,
			description: 'Two beef patties, cheese, special sauce, white bun'
		},
		explanation:
			'The grilled chicken salad has less than half the calories and is packed with nutrients from the greens and lean protein!'
	},
	{
		optionA: {
			name: 'French Fries (Large)',
			emoji: '🍟',
			calories: 510,
			description: 'Deep-fried potatoes, heavy salt, served large'
		},
		optionB: {
			name: 'Sweet Potato Wedges',
			emoji: '🍠',
			calories: 180,
			description: 'Oven-baked sweet potato, light seasoning',
			isHealthier: true
		},
		explanation:
			'Baked sweet potato wedges are rich in fiber and vitamin A, with far less fat than deep-fried french fries!'
	},
	{
		optionA: {
			name: 'Green Smoothie',
			emoji: '🥤',
			calories: 180,
			description: 'Spinach, banana, almond milk, chia seeds',
			isHealthier: true
		},
		optionB: {
			name: 'Milkshake',
			emoji: '🥛',
			calories: 580,
			description: 'Vanilla ice cream, whole milk, whipped cream, syrup'
		},
		explanation:
			'The green smoothie delivers vitamins and fiber from real ingredients, while milkshakes are loaded with sugar and saturated fat.'
	},
	{
		optionA: {
			name: 'Pepperoni Pizza Slice',
			emoji: '🍕',
			calories: 430,
			description: 'White flour crust, mozzarella, pepperoni, tomato sauce'
		},
		optionB: {
			name: 'Veggie Wrap',
			emoji: '🌯',
			calories: 290,
			description: 'Whole wheat tortilla, hummus, grilled veggies, feta',
			isHealthier: true
		},
		explanation:
			'The veggie wrap uses whole grains and plant-based protein from hummus, giving you sustained energy without the grease!'
	},
	{
		optionA: {
			name: 'Overnight Oats',
			emoji: '🥣',
			calories: 310,
			description: 'Rolled oats, yogurt, berries, honey, chia seeds',
			isHealthier: true
		},
		optionB: {
			name: 'Chocolate Croissant',
			emoji: '🥐',
			calories: 460,
			description: 'Buttery pastry, chocolate filling, powdered sugar'
		},
		explanation:
			'Overnight oats provide slow-release energy from whole grains and probiotics from yogurt. Croissants are mostly butter and refined flour.'
	},
	{
		optionA: {
			name: 'Fried Chicken Wings',
			emoji: '🍗',
			calories: 590,
			description: 'Deep-fried, breaded, with ranch dipping sauce'
		},
		optionB: {
			name: 'Grilled Salmon',
			emoji: '🐟',
			calories: 370,
			description: 'Wild-caught salmon, lemon, herbs, steamed broccoli',
			isHealthier: true
		},
		explanation:
			'Salmon is rich in omega-3 fatty acids for heart and brain health. Fried wings add unnecessary trans fats and empty calories.'
	},
	{
		optionA: {
			name: 'Trail Mix',
			emoji: '🥜',
			calories: 200,
			description: 'Almonds, walnuts, dried cranberries, dark chocolate chips',
			isHealthier: true
		},
		optionB: {
			name: 'Candy Bar',
			emoji: '🍫',
			calories: 280,
			description: 'Milk chocolate, caramel, nougat, high fructose corn syrup'
		},
		explanation:
			'Trail mix provides healthy fats, protein, and antioxidants. Candy bars spike your blood sugar and crash your energy.'
	},
	{
		optionA: {
			name: 'Soda (Large)',
			emoji: '🥤',
			calories: 390,
			description: '44oz cola, high fructose corn syrup, caffeine'
		},
		optionB: {
			name: 'Sparkling Water + Lime',
			emoji: '💧',
			calories: 0,
			description: 'Carbonated water, fresh lime wedge, no sugar',
			isHealthier: true
		},
		explanation:
			'A large soda has nearly 100g of sugar! Sparkling water gives you the fizz without any of the harmful sugar.'
	},
	{
		optionA: {
			name: 'Avocado Toast',
			emoji: '🥑',
			calories: 280,
			description: 'Whole grain bread, avocado, egg, everything seasoning',
			isHealthier: true
		},
		optionB: {
			name: 'Bacon & Egg McMuffin',
			emoji: '🥓',
			calories: 470,
			description: 'English muffin, processed cheese, bacon, fried egg'
		},
		explanation:
			'Avocado toast on whole grain gives you healthy monounsaturated fats and fiber. The McMuffin adds processed meat and excess sodium.'
	},
	{
		optionA: {
			name: 'Ice Cream Sundae',
			emoji: '🍨',
			calories: 580,
			description: 'Three scoops, hot fudge, whipped cream, sprinkles'
		},
		optionB: {
			name: 'Greek Yogurt Parfait',
			emoji: '🍓',
			calories: 220,
			description: 'Plain Greek yogurt, fresh berries, granola, honey drizzle',
			isHealthier: true
		},
		explanation:
			'Greek yogurt parfait satisfies your sweet tooth with probiotics and protein, while ice cream sundaes are mostly sugar and fat.'
	}
];
