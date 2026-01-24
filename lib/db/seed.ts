import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { collections, occasions, productTypes, formats } from './schema';
import { generateSlug } from '../utils/slug';

const runSeed = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('⏳ Seeding database...');

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    // Seed Collections
    console.log('📦 Seeding collections...');
    const collectionsData = [
      {
        slug: generateSlug('Personal Growth'),
        title: 'Personal Growth',
        description: 'Tools and resources for self-improvement and personal development',
        imageUrl: 'https://assets.digiinsta.store/collections/personal-growth.jpg',
      },
      {
        slug: generateSlug('Romantic Connection'),
        title: 'Romantic Connection',
        description: 'Strengthen your romantic relationships with meaningful activities',
        imageUrl: 'https://assets.digiinsta.store/collections/romantic-connection.jpg',
      },
      {
        slug: generateSlug('Kids & Family'),
        title: 'Kids & Family',
        description: 'Create lasting memories and strengthen family bonds',
        imageUrl: 'https://assets.digiinsta.store/collections/kids-family.jpg',
      },
      {
        slug: generateSlug('Social Connection'),
        title: 'Social Connection',
        description: 'Build deeper friendships and social connections',
        imageUrl: 'https://assets.digiinsta.store/collections/social-connection.jpg',
      },
      {
        slug: generateSlug('Professional Growth'),
        title: 'Professional Growth',
        description: 'Advance your career and professional development',
        imageUrl: 'https://assets.digiinsta.store/collections/professional-growth.jpg',
      },
    ];

    for (const collection of collectionsData) {
      await db.insert(collections).values(collection).onConflictDoNothing();
    }
    console.log('✅ Collections seeded');

    // Seed Occasions
    console.log('🎉 Seeding occasions...');
    const occasionsData = [
      {
        slug: generateSlug("Valentine's Day"),
        title: "Valentine's Day",
        description: 'Celebrate love and romance with special activities',
        imageUrl: 'https://assets.digiinsta.store/occasions/valentines-day.jpg',
      },
      {
        slug: generateSlug('Anniversary'),
        title: 'Anniversary',
        description: 'Commemorate your special milestones together',
        imageUrl: 'https://assets.digiinsta.store/occasions/anniversary.jpg',
      },
      {
        slug: generateSlug('Birthday'),
        title: 'Birthday',
        description: 'Make birthdays extra special with thoughtful activities',
        imageUrl: 'https://assets.digiinsta.store/occasions/birthday.jpg',
      },
      {
        slug: generateSlug('Date Night'),
        title: 'Date Night',
        description: 'Create memorable date night experiences',
        imageUrl: 'https://assets.digiinsta.store/occasions/date-night.jpg',
      },
      {
        slug: generateSlug('Everyday'),
        title: 'Everyday',
        description: 'Perfect for any day to strengthen your connection',
        imageUrl: 'https://assets.digiinsta.store/occasions/everyday.jpg',
      },
      {
        slug: generateSlug('Christmas'),
        title: 'Christmas',
        description: 'Celebrate the holiday season with meaningful activities',
        imageUrl: 'https://assets.digiinsta.store/occasions/christmas.jpg',
      },
    ];

    for (const occasion of occasionsData) {
      await db.insert(occasions).values(occasion).onConflictDoNothing();
    }
    console.log('✅ Occasions seeded');

    // Seed Product Types
    console.log('📝 Seeding product types...');
    const productTypesData = [
      { title: 'Journal' },
      { title: 'Planner' },
      { title: 'Conversation Cards' },
      { title: 'Activity Guide' },
      { title: 'Workbook' },
      { title: 'Checklist' },
      { title: 'Template' },
      { title: 'Game' },
      { title: 'Challenge' },
    ];

    for (const productType of productTypesData) {
      await db.insert(productTypes).values(productType).onConflictDoNothing();
    }
    console.log('✅ Product types seeded');

    // Seed Formats
    console.log('📄 Seeding formats...');
    const formatsData = [
      { title: 'PDF' },
      { title: 'Editable PDF' },
      { title: 'Canva Template' },
      { title: 'Google Docs' },
      { title: 'Printable' },
      { title: 'Digital Download' },
    ];

    for (const format of formatsData) {
      await db.insert(formats).values(format).onConflictDoNothing();
    }
    console.log('✅ Formats seeded');

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('Summary:');
    console.log(`- ${collectionsData.length} collections`);
    console.log(`- ${occasionsData.length} occasions`);
    console.log(`- ${productTypesData.length} product types`);
    console.log(`- ${formatsData.length} formats`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to /admin to access the admin dashboard');
    console.log('2. Sync products from Lemon Squeezy');
    console.log('3. Enhance products with taxonomies');

  } catch (error) {
    console.error('❌ Seeding failed');
    console.error(error);
    throw error;
  } finally {
    await connection.end();
  }
};

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
