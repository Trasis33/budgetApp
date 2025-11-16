const db = require('../db/database');

// Map old named colors to hex values
const COLOR_MAP = {
  mint: '#10b981',      // Green/Emerald
  amber: '#f59e0b',     // Amber
  indigo: '#6366f1',    // Indigo
  violet: '#8b5cf6',    // Violet
  teal: '#14b8a6',      // Teal
  coral: '#f43f5e',     // Rose/Coral
  cyan: '#06b6d4',      // Cyan
  periwinkle: '#8b5cf6', // Violet/Periwinkle
  golden: '#f59e0b',    // Amber/Golden
  yellow: '#eab308',    // Yellow
};

// Original category mappings from constants.ts
const ORIGINAL_CATEGORY_COLORS = {
  'Groceries': 'mint',
  'Dining Out': 'amber',
  'Transportation': 'indigo',
  'Entertainment': 'violet',
  'Shopping': 'teal',
  'Utilities': 'cyan',
  'Healthcare': 'coral',
  'Mortgage': 'golden',
  'Subscriptions': 'yellow',
  'Education': 'teal',
  'Travel': 'mint',
  'Fitness': 'amber',
  'Pets': 'indigo',
  'Gifts': 'violet',
  'Charity': 'coral',
  'Other': 'periwinkle',
  'Kids Clothes': 'teal',
  'Household Items': 'golden',
  // Add common categories
  'Food': 'mint',
  'Housing': 'golden',
  'Savings': 'cyan',
};

async function restoreCategoryColors() {
  try {
    console.log('🎨 Restoring original category colors...\n');

    // Get all categories
    const categories = await db('categories').select('*');
    console.log(`Found ${categories.length} categories\n`);

    let updatedCount = 0;

    for (const category of categories) {
      const colorName = ORIGINAL_CATEGORY_COLORS[category.name];
      
      if (colorName) {
        const hexColor = COLOR_MAP[colorName];
        
        await db('categories')
          .where('id', category.id)
          .update({ color: hexColor });
        
        console.log(`✅ ${category.name.padEnd(20)} → ${colorName.padEnd(12)} (${hexColor})`);
        updatedCount++;
      } else {
        console.log(`⚠️  ${category.name.padEnd(20)} → No mapping found, keeping default`);
      }
    }

    console.log(`\n✨ Updated ${updatedCount} out of ${categories.length} categories`);
    
    // Show final state
    console.log('\n📊 Final category colors:');
    const finalCategories = await db('categories').select('name', 'color').orderBy('name');
    finalCategories.forEach(cat => {
      console.log(`   ${cat.name.padEnd(20)} → ${cat.color}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error restoring colors:', error);
    process.exit(1);
  }
}

restoreCategoryColors();
