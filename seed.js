const db = require('./db');

async function seedDatabase() {
    try {
        console.log('Starting database seeding...');

        // 1. Insert Categories
        await db.execute(`DELETE FROM categories`);
        await db.execute(`
            INSERT INTO categories (id, name, description) VALUES
            (1, 'Dresses', 'Elegantly tailored formal and casual dresses'),
            (2, 'Suits & Blazers', 'Bespoke outerwear and structured blazers'),
            (3, 'Tops & Blouses', 'Versatile tops for everyday styling')
        `);

        // 2. Insert Products with Body Shape Metadata
        await db.execute(`DELETE FROM products`);
        const productQueries = [
            `INSERT INTO products (category_id, title, description, price, image_url, fit_type, recommended_shape) VALUES
            (1, 'Hourglass Satin Midi Dress', 'Cinched waist dress highlighting balanced proportions.', 129.99, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', 'Tailored', 'Hourglass')`,
            `INSERT INTO products (category_id, title, description, price, image_url, fit_type, recommended_shape) VALUES
            (2, 'Structured Shoulder Blazer', 'Defined shoulders to balance hips and create structure.', 189.50, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500', 'Oversized', 'Pear')`,
            `INSERT INTO products (category_id, title, description, price, image_url, fit_type, recommended_shape) VALUES
            (1, 'Belted A-Line Floral Dress', 'Flared silhouette adding dimension to straight body lines.', 95.00, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500', 'Regular', 'Rectangle')`,
            `INSERT INTO products (category_id, title, description, price, image_url, fit_type, recommended_shape) VALUES
            (3, 'V-Neck Silk Wrap Top', 'Soft draped neckline that balances broad shoulders gracefully.', 78.25, 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=500', 'Slim', 'Inverted Triangle')`
        ];

        for (const query of productQueries) {
            await db.execute(query);
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error.message);
        process.exit(1);
    }
}

seedDatabase();