export type Category = 'protein' | 'veggie' | 'grain' | 'fat' | 'sugar' | 'dairy' | 'fruit';

export interface Ingredient {
	id: string;
	name: string;
	emoji: string;
	healthScore: number; // 1–10
	calories: number;
	benefit: string; // revealed after submit — explains WHY
	category: Category;
}

export interface DishChallenge {
	id: string;
	title: string;
	prompt: string;
	emoji: string;
	pickCount: number;
	ingredients: Ingredient[];
}

export const categoryMeta: Record<Category, { label: string; color: string }> = {
	protein: { label: 'Protein',     color: 'bg-purple text-white'       },
	veggie:  { label: 'Veggie',      color: 'bg-teal text-white'         },
	grain:   { label: 'Grain',       color: 'bg-yellow text-black'       },
	fat:     { label: 'Healthy Fat', color: 'bg-orange-300 text-black'   },
	sugar:   { label: 'Sugar',       color: 'bg-[#f87171] text-white'    },
	dairy:   { label: 'Dairy',       color: 'bg-blue-300 text-black'     },
	fruit:   { label: 'Fruit',       color: 'bg-pink-300 text-black'     }
};

// ─────────────────────────────────────────────────────────────────────────────
// Score distribution target per challenge (15–16 ingredients):
//   8–10  → ~5  genuinely excellent picks   (user WANTS these)
//   5–7   → ~4  decent but imperfect picks
//   3–5   → ~4  TRAPS — sound healthy, actually aren't
//   1–2   → ~3  obviously unhealthy
// This forces careful reading rather than grabbing anything "green-sounding".
// ─────────────────────────────────────────────────────────────────────────────

export const challenges: DishChallenge[] = [

	// ─── SALAD ──────────────────────────────────────────────
	{
		id: 'salad',
		title: 'Build the Healthiest Salad',
		prompt: 'Pick any 5 ingredients. Some options look healthy but aren\'t — read carefully!',
		emoji: '🥗',
		pickCount: 5,
		ingredients: [
			// ── Excellent ──
			{ id: 's1',  name: 'Baby Spinach',           emoji: '🌿', healthScore: 9, calories: 20,  benefit: 'Iron, folate, vitamins A, C, and K — truly a superfood', category: 'veggie'  },
			{ id: 's2',  name: 'Grilled Chicken Breast', emoji: '🍗', healthScore: 9, calories: 165, benefit: 'Leanest protein source — very low saturated fat',           category: 'protein' },
			{ id: 's3',  name: 'Cherry Tomatoes',        emoji: '🍅', healthScore: 8, calories: 25,  benefit: 'Lycopene, vitamin C, and powerful antioxidants',            category: 'veggie'  },
			{ id: 's4',  name: 'Avocado',                emoji: '🥑', healthScore: 8, calories: 160, benefit: 'Heart-healthy monounsaturated fats and potassium',           category: 'fat'     },
			{ id: 's5',  name: 'Olive Oil & Lemon',      emoji: '🫒', healthScore: 8, calories: 50,  benefit: 'Polyphenols and vitamin C — the gold-standard dressing',     category: 'fat'     },
			// ── Decent ──
			{ id: 's6',  name: 'Chickpeas',              emoji: '🫘', healthScore: 7, calories: 134, benefit: 'Plant protein and fibre — slightly starchy but solid',       category: 'protein' },
			{ id: 's7',  name: 'Cucumber',               emoji: '🥒', healthScore: 7, calories: 12,  benefit: 'Hydrating with B and C vitamins',                           category: 'veggie'  },
			{ id: 's8',  name: 'Feta Cheese',            emoji: '🧀', healthScore: 5, calories: 75,  benefit: 'Some calcium, but fairly high in sodium',                    category: 'dairy'   },
			{ id: 's9',  name: 'Sunflower Seeds',        emoji: '🌻', healthScore: 6, calories: 165, benefit: 'Vitamin E and selenium, but calorie-dense — use sparingly',  category: 'fat'     },
			// ── Traps (sound healthy, aren't) ──
			{ id: 's10', name: 'Dried Cranberries',      emoji: '🍒', healthScore: 3, calories: 123, benefit: 'TRAP: "fruit" but commercial versions have 25g added sugar per serving!', category: 'sugar'  },
			{ id: 's11', name: 'Low-fat Dressing',       emoji: '🫙', healthScore: 3, calories: 80,  benefit: 'TRAP: removing fat means adding sugar and artificial thickeners instead',  category: 'sugar'  },
			{ id: 's12', name: 'Honey Mustard Dressing', emoji: '🍯', healthScore: 4, calories: 130, benefit: 'TRAP: sounds light but packed with sugar and refined oil',                 category: 'sugar'  },
			{ id: 's13', name: 'Crispy Chickpea Crunch', emoji: '⭕', healthScore: 3, calories: 135, benefit: 'TRAP: chickpeas are great — but deep-frying kills their benefits',          category: 'grain'  },
			// ── Clearly bad ──
			{ id: 's14', name: 'Ranch Dressing',         emoji: '🥛', healthScore: 2, calories: 145, benefit: 'High in saturated fat, sugar, and preservatives',            category: 'fat'     },
			{ id: 's15', name: 'Bacon Bits',             emoji: '🥓', healthScore: 2, calories: 130, benefit: 'Processed meat — high sodium and saturated fat',             category: 'protein' },
			{ id: 's16', name: 'Crispy Tortilla Strips', emoji: '🌽', healthScore: 1, calories: 140, benefit: 'Deep-fried corn — trans fats with zero nutritional value',   category: 'grain'   }
		]
	},

	// ─── SMOOTHIE ────────────────────────────────────────────
	{
		id: 'smoothie',
		title: 'Build the Healthiest Smoothie',
		prompt: 'Pick any 4 ingredients. Watch out — many "health" drinks are sugar bombs in disguise!',
		emoji: '🥤',
		pickCount: 4,
		ingredients: [
			// ── Excellent ──
			{ id: 'sm1', name: 'Baby Kale',              emoji: '🥦', healthScore: 9,  calories: 33,  benefit: 'Vitamin K, beta-carotene, iron, and calcium',               category: 'veggie'  },
			{ id: 'sm2', name: 'Blueberries (frozen)',   emoji: '🫐', healthScore: 9,  calories: 57,  benefit: 'Highest antioxidant density of any fruit — frozen = as good as fresh', category: 'fruit' },
			{ id: 'sm3', name: 'Chia Seeds',             emoji: '🌱', healthScore: 9,  calories: 138, benefit: 'Omega-3 fatty acids, fibre, and plant protein',              category: 'grain'   },
			{ id: 'sm4', name: 'Plain Greek Yogurt',     emoji: '🥛', healthScore: 8,  calories: 100, benefit: 'High protein + live probiotics for gut health',              category: 'dairy'   },
			{ id: 'sm5', name: 'Spinach',                emoji: '🌿', healthScore: 9,  calories: 20,  benefit: 'You can\'t taste it but it\'s packed with micronutrients',   category: 'veggie'  },
			// ── Decent ──
			{ id: 'sm6', name: 'Banana',                 emoji: '🍌', healthScore: 7,  calories: 89,  benefit: 'Potassium and natural energy — just don\'t overdo it',       category: 'fruit'   },
			{ id: 'sm7', name: 'Unsweetened Almond Milk',emoji: '🍶', healthScore: 7,  calories: 30,  benefit: 'Low calorie with vitamin E — make sure it\'s unsweetened',    category: 'dairy'   },
			{ id: 'sm8', name: 'Flaxseeds',              emoji: '🌾', healthScore: 7,  calories: 55,  benefit: 'Lignans and omega-3 — great for hormonal balance',            category: 'grain'   },
			// ── Traps ──
			{ id: 'sm9',  name: 'Flavoured Greek Yogurt', emoji: '🍓', healthScore: 3, calories: 150, benefit: 'TRAP: looks like Greek yogurt but has 15–20g added sugar per serving!', category: 'sugar' },
			{ id: 'sm10', name: 'Orange Juice',           emoji: '🍊', healthScore: 3, calories: 112, benefit: 'TRAP: "natural" but zero fibre — just 26g of sugar with no filling power', category: 'sugar' },
			{ id: 'sm11', name: 'Bottled Green Smoothie', emoji: '💚', healthScore: 3, calories: 160, benefit: 'TRAP: marketed as a superfood drink but typically 30g sugar and pasteurised', category: 'sugar' },
			{ id: 'sm12', name: 'Agave Syrup',            emoji: '🍯', healthScore: 2, calories: 60,  benefit: 'TRAP: marketed as "natural sweetener" but 85% fructose — worse than honey', category: 'sugar' },
			// ── Clearly bad ──
			{ id: 'sm13', name: 'Vanilla Ice Cream',     emoji: '🍨', healthScore: 1, calories: 207, benefit: 'High sugar and saturated fat — makes a dessert, not a smoothie', category: 'sugar' },
			{ id: 'sm14', name: 'Chocolate Syrup',       emoji: '🍫', healthScore: 1, calories: 109, benefit: 'Almost entirely sugar with artificial additives',              category: 'sugar'   },
			{ id: 'sm15', name: 'Sweetened Coconut Milk',emoji: '🥥', healthScore: 2, calories: 230, benefit: 'High in saturated fat and almost always sweetened with sugar', category: 'fat'     }
		]
	},

	// ─── BREAKFAST ───────────────────────────────────────────
	{
		id: 'breakfast',
		title: 'Build the Healthiest Breakfast',
		prompt: 'Pick any 5 morning items. Several "healthy breakfast" classics are actually sugar traps!',
		emoji: '🍳',
		pickCount: 5,
		ingredients: [
			// ── Excellent ──
			{ id: 'b1',  name: 'Steel-Cut Oats',         emoji: '🥣', healthScore: 9, calories: 150, benefit: 'Low GI, high fibre — keeps you full for hours',              category: 'grain'   },
			{ id: 'b2',  name: 'Fresh Berries',          emoji: '🍓', healthScore: 9, calories: 50,  benefit: 'Antioxidants, vitamin C, and fibre — no added sugar',        category: 'fruit'   },
			{ id: 'b3',  name: 'Boiled / Poached Eggs',  emoji: '🥚', healthScore: 9, calories: 78,  benefit: 'Complete protein, choline for brain health',                  category: 'protein' },
			{ id: 'b4',  name: 'Chia Seeds',             emoji: '🌱', healthScore: 9, calories: 138, benefit: 'Omega-3, fibre, and slow-digesting protein',                  category: 'grain'   },
			{ id: 'b5',  name: 'Avocado',                emoji: '🥑', healthScore: 8, calories: 160, benefit: 'Healthy fats that slow glucose absorption',                   category: 'fat'     },
			// ── Decent ──
			{ id: 'b6',  name: 'Whole Grain Toast',      emoji: '🍞', healthScore: 7, calories: 80,  benefit: 'Fibre and complex carbs — check the label for "100% whole grain"', category: 'grain' },
			{ id: 'b7',  name: 'Banana',                 emoji: '🍌', healthScore: 6, calories: 89,  benefit: 'Potassium and B6 — but a ripe banana spikes blood sugar faster', category: 'fruit' },
			{ id: 'b8',  name: 'Cottage Cheese',         emoji: '🥛', healthScore: 7, calories: 98,  benefit: 'High protein, low fat — often overlooked breakfast gem',      category: 'dairy'   },
			// ── Traps ──
			{ id: 'b9',  name: 'Instant Oatmeal Packet', emoji: '📦', healthScore: 3, calories: 160, benefit: 'TRAP: "oats" on the label but flavoured packets have 12–16g added sugar', category: 'sugar' },
			{ id: 'b10', name: 'Commercial Granola',     emoji: '🌾', healthScore: 3, calories: 200, benefit: 'TRAP: oats + nuts sound great but most granola has 10–15g sugar per cup', category: 'sugar' },
			{ id: 'b11', name: 'Fruit Yogurt Pot',       emoji: '🍑', healthScore: 3, calories: 140, benefit: 'TRAP: yogurt is great — but fruity pots usually have 20g added sugar', category: 'sugar' },
			{ id: 'b12', name: 'Orange Juice (glass)',   emoji: '🍊', healthScore: 3, calories: 112, benefit: 'TRAP: "fresh squeezed" still packs 26g sugar with zero fibre', category: 'sugar' },
			// ── Clearly bad ──
			{ id: 'b13', name: 'Bacon Strips',           emoji: '🥓', healthScore: 2, calories: 135, benefit: 'High in sodium and saturated fat — processed meat',           category: 'protein' },
			{ id: 'b14', name: 'Croissant',              emoji: '🥐', healthScore: 2, calories: 272, benefit: 'Mostly refined flour and butter — minimal nutrition',          category: 'grain'   },
			{ id: 'b15', name: 'Sugary Cereal',          emoji: '🍬', healthScore: 1, calories: 120, benefit: 'More sugar than a cookie — negligible real nutrition',        category: 'grain'   },
			{ id: 'b16', name: 'Pancakes + Maple Syrup', emoji: '🥞', healthScore: 1, calories: 350, benefit: 'Refined flour base plus 30g+ syrup sugar — a dessert for breakfast', category: 'sugar' }
		]
	},

	// ─── POWER BOWL ──────────────────────────────────────────
	{
		id: 'power-bowl',
		title: 'Build the Healthiest Power Bowl',
		prompt: 'Pick any 5 ingredients. Some "trendy health" items aren\'t as clean as they look!',
		emoji: '🍱',
		pickCount: 5,
		ingredients: [
			// ── Excellent ──
			{ id: 'p1',  name: 'Grilled Salmon',         emoji: '🐟', healthScore: 10, calories: 208, benefit: 'The best omega-3 source + complete lean protein',           category: 'protein' },
			{ id: 'p2',  name: 'Quinoa',                 emoji: '🫘', healthScore: 9,  calories: 222, benefit: 'Only grain with all essential amino acids — high protein',  category: 'grain'   },
			{ id: 'p3',  name: 'Steamed Broccoli',       emoji: '🥦', healthScore: 9,  calories: 55,  benefit: 'Sulforaphane, vitamin C and K — cancer-fighting compounds', category: 'veggie'  },
			{ id: 'p4',  name: 'Black Beans',            emoji: '⚫', healthScore: 8,  calories: 227, benefit: 'Plant protein, fibre, and antioxidant anthocyanins',        category: 'protein' },
			{ id: 'p5',  name: 'Roasted Sweet Potato',   emoji: '🍠', healthScore: 8,  calories: 103, benefit: 'Beta-carotene, fibre, and complex slow-release carbs',     category: 'veggie'  },
			// ── Decent ──
			{ id: 'p6',  name: 'Brown Rice',             emoji: '🍚', healthScore: 7,  calories: 216, benefit: 'More fibre and B vitamins than white rice, but still starchy', category: 'grain' },
			{ id: 'p7',  name: 'Edamame',                emoji: '🌿', healthScore: 7,  calories: 122, benefit: 'Good plant protein and folate',                             category: 'protein' },
			{ id: 'p8',  name: 'Sliced Avocado',         emoji: '🥑', healthScore: 8,  calories: 160, benefit: 'Healthy fats that help absorb fat-soluble vitamins',        category: 'fat'     },
			// ── Traps ──
			{ id: 'p9',  name: 'Store-bought Teriyaki',  emoji: '🍯', healthScore: 3,  calories: 80,  benefit: 'TRAP: teriyaki sauce is mostly sugar and high-sodium soy sauce', category: 'sugar' },
			{ id: 'p10', name: 'Crispy Quinoa Puffs',    emoji: '⭕', healthScore: 3,  calories: 120, benefit: 'TRAP: quinoa sounds healthy but puffed and fried versions lose all the benefits', category: 'grain' },
			{ id: 'p11', name: 'Coconut Aminos Glaze',   emoji: '🥥', healthScore: 4,  calories: 90,  benefit: 'TRAP: marketed as "healthier soy sauce" but still very high in sugar', category: 'sugar' },
			{ id: 'p12', name: 'Pickled Ginger (sweet)', emoji: '🫚', healthScore: 4,  calories: 20,  benefit: 'TRAP: ginger is great but the pickled kind is sweetened with lots of sugar', category: 'sugar' },
			// ── Clearly bad ──
			{ id: 'p13', name: 'Fried Chicken',          emoji: '🍗', healthScore: 3,  calories: 320, benefit: 'Deep frying creates trans fats and doubles calorie count',  category: 'protein' },
			{ id: 'p14', name: 'White Rice',             emoji: '🍙', healthScore: 4,  calories: 206, benefit: 'Fast-digesting carbs — very low in fibre and micronutrients', category: 'grain'  },
			{ id: 'p15', name: 'Processed Cheese Sauce', emoji: '🧀', healthScore: 1,  calories: 190, benefit: 'Hydrogenated oil, sodium, and artificial flavours',          category: 'dairy'   },
			{ id: 'p16', name: 'Corn Chips',             emoji: '🌽', healthScore: 1,  calories: 140, benefit: 'Deep-fried refined corn — high sodium, empty calories',     category: 'grain'   }
		]
	},

	// ─── SNACK PLATE ─────────────────────────────────────────
	{
		id: 'snack-plate',
		title: 'Build the Healthiest Snack Plate',
		prompt: 'Pick any 4 snacks. "Natural" doesn\'t always mean healthy — check the traps!',
		emoji: '🍽️',
		pickCount: 4,
		ingredients: [
			// ── Excellent ──
			{ id: 'sn1', name: 'Raw Carrot Sticks',       emoji: '🥕', healthScore: 9, calories: 35,  benefit: 'Beta-carotene, fibre, and vitamin K — very low calorie',    category: 'veggie'  },
			{ id: 'sn2', name: 'A Small Handful of Almonds', emoji: '🌰', healthScore: 9, calories: 164, benefit: 'Vitamin E, magnesium, and heart-healthy fats',          category: 'fat'     },
			{ id: 'sn3', name: 'Plain Greek Yogurt',      emoji: '🥛', healthScore: 8, calories: 100, benefit: 'High protein + probiotics — a genuinely filling snack',      category: 'dairy'   },
			{ id: 'sn4', name: 'Hummus + Veggie Sticks',  emoji: '🫙', healthScore: 8, calories: 100, benefit: 'Plant protein from chickpeas + fibre from the veg',          category: 'protein' },
			{ id: 'sn5', name: 'Apple Slices',            emoji: '🍎', healthScore: 8, calories: 57,  benefit: 'Fibre, antioxidants, and quercetin — naturally sweet',       category: 'fruit'   },
			// ── Decent ──
			{ id: 'sn6', name: 'Dark Chocolate (70%+)',   emoji: '🍫', healthScore: 6, calories: 170, benefit: 'Flavanoids and magnesium — fine in small amounts',           category: 'sugar'   },
			{ id: 'sn7', name: 'Edamame (lightly salted)',emoji: '🌿', healthScore: 7, calories: 120, benefit: 'Complete plant protein — one of the best snack options',     category: 'protein' },
			{ id: 'sn8', name: 'String Cheese',           emoji: '🧀', healthScore: 5, calories: 80,  benefit: 'Some protein and calcium, but watch the sodium content',     category: 'dairy'   },
			// ── Traps ──
			{ id: 'sn9',  name: 'Commercial Trail Mix',   emoji: '🍫', healthScore: 3, calories: 180, benefit: 'TRAP: store-bought mixes load in M&Ms, sugar-coated nuts, and dried fruit', category: 'sugar' },
			{ id: 'sn10', name: 'Veggie Chips',           emoji: '🥬', healthScore: 3, calories: 130, benefit: 'TRAP: made with vegetable powder, but still deep-fried — same as crisps',   category: 'grain' },
			{ id: 'sn11', name: 'Protein Bar',            emoji: '💪', healthScore: 4, calories: 220, benefit: 'TRAP: most bars have 20g+ sugar — essentially a candy bar with branding',   category: 'sugar' },
			{ id: 'sn12', name: 'Rice Cakes',             emoji: '⭕', healthScore: 4, calories: 35,  benefit: 'TRAP: low calorie but also very low nutrients — spikes blood sugar fast',   category: 'grain' },
			// ── Clearly bad ──
			{ id: 'sn13', name: 'Potato Chips',           emoji: '🥔', healthScore: 1, calories: 152, benefit: 'High sodium, trans fats, and zero nutritional value',        category: 'grain'   },
			{ id: 'sn14', name: 'Gummy Bears',            emoji: '🐻', healthScore: 1, calories: 130, benefit: 'Pure sugar and gelatin — no fibre, no protein, no nutrients', category: 'sugar'  },
			{ id: 'sn15', name: 'Candy Bar',              emoji: '🍬', healthScore: 1, calories: 240, benefit: 'Saturated fat, refined sugar, and artificial flavours',       category: 'sugar'   },
			{ id: 'sn16', name: 'Glazed Doughnut',        emoji: '🍩', healthScore: 1, calories: 260, benefit: 'Refined flour, deep-fried, then coated in sugar glaze',      category: 'sugar'   }
		]
	},

	// ─── PASTA ───────────────────────────────────────────────
	{
		id: 'pasta',
		title: 'Build the Healthiest Pasta Dish',
		prompt: 'Pick any 5 ingredients. Pasta night can be nutritious — or a total calorie bomb!',
		emoji: '🍝',
		pickCount: 5,
		ingredients: [
			// ── Excellent ──
			{ id: 'pa1', name: 'Lentil or Chickpea Pasta',emoji: '🍜', healthScore: 9, calories: 190, benefit: 'High protein, high fibre, lower GI than wheat pasta',        category: 'grain'   },
			{ id: 'pa2', name: 'Grilled Prawns',          emoji: '🦐', healthScore: 9, calories: 99,  benefit: 'Very lean protein with selenium, iodine, and B12',           category: 'protein' },
			{ id: 'pa3', name: 'Fresh Spinach / Basil',   emoji: '🌿', healthScore: 9, calories: 20,  benefit: 'Vitamins, minerals, and anti-inflammatory compounds',         category: 'veggie'  },
			{ id: 'pa4', name: 'Garlic + Olive Oil',      emoji: '🫒', healthScore: 8, calories: 70,  benefit: 'Allicin from garlic + polyphenols from olive oil',            category: 'fat'     },
			{ id: 'pa5', name: 'Cherry Tomatoes',         emoji: '🍅', healthScore: 8, calories: 25,  benefit: 'Lycopene from tomatoes is best absorbed when cooked',        category: 'veggie'  },
			// ── Decent ──
			{ id: 'pa6', name: 'Whole Wheat Pasta',       emoji: '🍝', healthScore: 7, calories: 174, benefit: 'Higher fibre and protein than white pasta — still starchy',  category: 'grain'   },
			{ id: 'pa7', name: 'Roasted Courgette',       emoji: '🥒', healthScore: 7, calories: 17,  benefit: 'High water content, vitamin C and K',                        category: 'veggie'  },
			{ id: 'pa8', name: 'Pine Nuts',               emoji: '🌰', healthScore: 6, calories: 191, benefit: 'Vitamin K and healthy fats — calorie-dense so portion carefully', category: 'fat' },
			// ── Traps ──
			{ id: 'pa9',  name: 'Jar Pasta Sauce',        emoji: '🍅', healthScore: 3, calories: 120, benefit: 'TRAP: homemade tomato = great, but jars often have 10g+ sugar and excess salt', category: 'sugar' },
			{ id: 'pa10', name: 'Light Cream Sauce',      emoji: '🫙', healthScore: 4, calories: 180, benefit: 'TRAP: "light" still means lots of cream and saturated fat',                    category: 'dairy' },
			{ id: 'pa11', name: 'Parmesan (large amount)',emoji: '🧀', healthScore: 4, calories: 220, benefit: 'TRAP: parmesan has protein and calcium but piled on it\'s very high in sodium', category: 'dairy' },
			// ── Clearly bad ──
			{ id: 'pa12', name: 'White Pasta (plain)',    emoji: '🍝', healthScore: 4, calories: 200, benefit: 'Refined flour spikes blood sugar quickly — low fibre',       category: 'grain'   },
			{ id: 'pa13', name: 'Full Cream Sauce',       emoji: '🫙', healthScore: 2, calories: 250, benefit: 'Very high in saturated fat with minimal vitamins or minerals', category: 'dairy'  },
			{ id: 'pa14', name: 'Processed Sausage',      emoji: '🌭', healthScore: 2, calories: 291, benefit: 'Processed meat with nitrates, high sodium, and saturated fat', category: 'protein'},
			{ id: 'pa15', name: 'Butter (heavy)',         emoji: '🧈', healthScore: 1, calories: 204, benefit: 'Pure saturated fat — minimal micronutrients',                 category: 'fat'     }
		]
	},

	// ─── STIR FRY ────────────────────────────────────────────
	{
		id: 'stir-fry',
		title: 'Build the Healthiest Stir Fry',
		prompt: 'Pick any 5 ingredients. Asian-inspired food can be very healthy — or very deceptive!',
		emoji: '🥘',
		pickCount: 5,
		ingredients: [
			// ── Excellent ──
			{ id: 'sf1', name: 'Bok Choy',               emoji: '🥬', healthScore: 9, calories: 13,  benefit: 'Vitamins A, C, K, and calcium — one of the most nutrient-dense veggies', category: 'veggie' },
			{ id: 'sf2', name: 'Shiitake Mushrooms',     emoji: '🍄', healthScore: 9, calories: 40,  benefit: 'Beta-glucans boost immune function and support gut health',   category: 'veggie'  },
			{ id: 'sf3', name: 'Grilled Chicken Strips', emoji: '🍗', healthScore: 9, calories: 165, benefit: 'Lean protein with essential amino acids',                     category: 'protein' },
			{ id: 'sf4', name: 'Broccoli Florets',       emoji: '🥦', healthScore: 9, calories: 55,  benefit: 'Sulforaphane and vitamins C and K',                           category: 'veggie'  },
			{ id: 'sf5', name: 'Fresh Ginger + Garlic',  emoji: '🫚', healthScore: 8, calories: 20,  benefit: 'Gingerol and allicin — potent anti-inflammatory compounds',   category: 'veggie'  },
			// ── Decent ──
			{ id: 'sf6', name: 'Firm Tofu',              emoji: '🟦', healthScore: 7, calories: 144, benefit: 'Complete plant protein with isoflavones — choose non-GMO',    category: 'protein' },
			{ id: 'sf7', name: 'Brown Rice (steamed)',   emoji: '🍚', healthScore: 7, calories: 216, benefit: 'Whole grain — more fibre and B vitamins than white rice',      category: 'grain'   },
			{ id: 'sf8', name: 'Snap Peas',              emoji: '🫛', healthScore: 7, calories: 26,  benefit: 'Vitamin C and satisfying crunch with good fibre content',     category: 'veggie'  },
			// ── Traps ──
			{ id: 'sf9',  name: 'Bottled Stir Fry Sauce',emoji: '🫙', healthScore: 2, calories: 120, benefit: 'TRAP: almost all bottled stir fry sauces are high-sodium sugar syrups', category: 'sugar' },
			{ id: 'sf10', name: 'Soy Sauce (heavy pour)',emoji: '🫙', healthScore: 3, calories: 10,  benefit: 'TRAP: soy sauce is 900mg sodium per tablespoon — a heavy pour exceeds daily limits', category: 'sugar' },
			{ id: 'sf11', name: 'Prawn Crackers',        emoji: '🦐', healthScore: 3, calories: 145, benefit: 'TRAP: "prawn" sounds healthy but these are deep-fried starch with minimal prawn', category: 'grain' },
			{ id: 'sf12', name: 'Sweet Chilli Sauce',    emoji: '🌶️', healthScore: 3, calories: 100, benefit: 'TRAP: chilli sounds healthy but this sauce is mostly sugar syrup',              category: 'sugar' },
			// ── Clearly bad ──
			{ id: 'sf13', name: 'Deep-fried Tofu',       emoji: '🍤', healthScore: 3, calories: 270, benefit: 'Frying doubles calories and adds unhealthy fats to an otherwise great food', category: 'protein' },
			{ id: 'sf14', name: 'Fried White Rice',      emoji: '🍙', healthScore: 2, calories: 340, benefit: 'Refined carbs fried in oil — high calorie, low nutrition',    category: 'grain'   },
			{ id: 'sf15', name: 'Sweet & Sour Sauce',    emoji: '🍬', healthScore: 1, calories: 130, benefit: 'High fructose corn syrup base — essentially candy sauce',     category: 'sugar'   }
		]
	}
];

export function getMaxScore(challenge: DishChallenge): number {
	return challenge.ingredients
		.map((i) => i.healthScore)
		.sort((a, b) => b - a)
		.slice(0, challenge.pickCount)
		.reduce((sum, s) => sum + s, 0);
}

export function getOptimalIngredients(challenge: DishChallenge): Ingredient[] {
	return [...challenge.ingredients]
		.sort((a, b) => b.healthScore - a.healthScore)
		.slice(0, challenge.pickCount);
}

export function calcRoundPoints(challenge: DishChallenge, selectedIds: string[]): number {
	const userScore = selectedIds.reduce((sum, id) => {
		const ing = challenge.ingredients.find((i) => i.id === id);
		return sum + (ing?.healthScore ?? 0);
	}, 0);
	const maxScore = getMaxScore(challenge);
	return Math.round((userScore / maxScore) * 100);
}

export function getScoreColor(score: number): string {
	if (score >= 8) return 'text-teal border-teal bg-teal/10';
	if (score >= 5) return 'text-yellow-600 border-yellow-400 bg-yellow/20';
	return 'text-[#f87171] border-[#f87171] bg-red-50';
}

export function getScoreLabel(score: number): string {
	if (score >= 8) return 'Excellent';
	if (score >= 5) return 'Moderate';
	return 'Poor';
}
