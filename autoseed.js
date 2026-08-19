const bcrypt = require('bcryptjs');

module.exports = async function autoSeed(db) {
    try {
        const userCount = await db.User.count();
        if (userCount > 0) {
            console.log('Database already has data. Skipping auto-seed.');
            return;
        }

        console.log('Database empty. Running auto-seed...');

        // 1. Create Admin User
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.User.bulkCreate([
            { email: 'jahirul991133@gmail.com', password: hashedPassword },
            { email: 'jahirul119933@gmail.com', password: hashedPassword },
            { email: 'admin@rksteelfurniture.com', password: hashedPassword }
        ]);

        // 2. Create Global Settings
        const settings = [
            { key: 'businessName', value: 'RK STEEL FURNITURE' },
            { key: 'tagline1', value: 'Strong • Stylish • Durable' },
            { key: 'tagline2', value: 'Better Furniture, Better Life' },
            { key: 'phone', value: '+91 9394940647' },
            { key: 'whatsapp', value: '+91 9394940647' },
            { key: 'location', value: 'Assam, Lanka' },
            { key: 'deliveryRadius', value: '30 KM' },
            { key: 'freeDelivery', value: 'true' },
            { key: 'logo', value: 'logo.png' }
        ];
        await db.Settings.bulkCreate(settings);

        // 3. Create Products
        const products = [
            { name: '2 Door Steel Almirah', description: 'Strong and spacious steel almirah with modern design.', price: '8,999', image: 'a.png', order: 1, whatsappMsg: 'Hello RK Steel Furniture, I am interested in the 2 Door Steel Almirah.' },
            { name: '3 Door Steel Almirah', description: 'Large-capacity steel wardrobe suitable for families.', price: '12,999', image: 'a1.png', order: 2, whatsappMsg: 'Hello RK Steel Furniture, I am interested in the 3 Door Steel Almirah.' },
            { name: 'Mirror Almirah', description: 'Stylish steel almirah with integrated mirror.', price: '10,999', image: 'a2.png', order: 3, whatsappMsg: 'Hello RK Steel Furniture, I am interested in the Mirror Almirah.' },
            { name: '2 / 3 Door Almirah', description: 'Modern multi-door steel wardrobe designs.', price: '11,999', image: 'a3.png', order: 4, whatsappMsg: 'Hello RK Steel Furniture, I am interested in the 2/3 Door Almirah.' },
            { name: 'Dressing Table', description: 'Elegant and practical steel dressing table.', price: '7,499', image: 'a4.png', order: 5, whatsappMsg: 'Hello RK Steel Furniture, I am interested in the Dressing Table.' },
            { name: 'Office Furniture', description: 'Durable steel furniture solutions for offices and workspaces.', price: '6,999', image: 'a5.png', order: 6, whatsappMsg: 'Hello RK Steel Furniture, I am interested in Office Furniture.' },
            { name: 'Premium Steel Wardrobe', description: 'Luxurious design and enhanced storage capacity.', price: '13,499', image: 'a6.png', order: 7, whatsappMsg: 'Hello RK Steel Furniture, I am interested in the Premium Steel Wardrobe.' },
            { name: 'Modern Steel Storage', description: 'Versatile steel cabinet for everyday home storage.', price: '9,499', image: 'a7.png', order: 8, whatsappMsg: 'Hello RK Steel Furniture, I am interested in the Modern Steel Storage.' },
            { name: 'Classic Almirah', description: 'Traditional design mixed with modern durability.', price: '10,499', image: 'a8.png', order: 9, whatsappMsg: 'Hello RK Steel Furniture, I am interested in the Classic Almirah.' },
            { name: 'Deluxe Steel Cabinet', description: 'Spacious cabinet with high-quality locking system.', price: '11,499', image: 'a9.png', order: 10, whatsappMsg: 'Hello RK Steel Furniture, I am interested in the Deluxe Steel Cabinet.' },
            { name: 'Compact Steel Almirah', description: 'Perfect storage solution for smaller rooms.', price: '8,499', image: 'a10.png', order: 11, whatsappMsg: 'Hello RK Steel Furniture, I am interested in the Compact Steel Almirah.' }
        ];
        await db.Product.bulkCreate(products);

        // 4. Create Sections
        const sections = [
            { sectionId: 'hero', name: 'Hero Section', order: 1, content: JSON.stringify({ heading: 'RK STEEL FURNITURE', subheading: 'STRONG • STYLISH • DURABLE', description: 'Better Furniture, Better Life', bgImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1920&auto=format&fit=crop' }) },
            { sectionId: 'features', name: 'Feature Highlights', order: 2, content: JSON.stringify([ { title: 'Premium Quality', desc: 'Built to last generations' }, { title: 'Home Delivery', desc: 'Safe & fast shipping' }, { title: 'Cash on Delivery', desc: 'Pay when you receive' }, { title: 'Visit Showroom', desc: 'Experience the quality' } ]) },
            { sectionId: 'showroom', name: 'Showroom Section', order: 3, content: JSON.stringify({ image: 'b.png', heading: 'VISIT OUR SHOWROOM', tagline: 'See the Quality, Feel the Strength, Choose the Best!' }) },
            { sectionId: 'about', name: 'About Us Section', order: 4, content: JSON.stringify({ heading: 'ABOUT RK STEEL FURNITURE', p1: 'Welcome to RK Steel Furniture. We are dedicated to providing the highest quality steel furniture that combines durability, style, and functionality.', p2: 'With years of experience in the industry, we understand what our customers need. Whether you are looking for a secure steel almirah for your home or durable office furniture, we have the perfect solutions.', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=800&auto=format&fit=crop' }) }
        ];
        await db.Section.bulkCreate(sections);

        console.log('Database auto-seeded successfully!');
    } catch (e) {
        console.error('Error auto-seeding database:', e);
    }
};
