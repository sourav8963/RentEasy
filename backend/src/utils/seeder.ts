import bcrypt from 'bcryptjs';
import { UserService } from '../services/userService';
import { ProductService } from '../services/productService';
import { JsonDb } from '../services/dbFallback';
import User from '../models/User';
import Product from '../models/Product';

export const seedDatabase = async (): Promise<void> => {
  try {
    let usersCount = 0;
    let productsCount = 0;

    if (JsonDb.isMongoActive) {
      usersCount = await User.countDocuments();
      productsCount = await Product.countDocuments();
    } else {
      usersCount = JsonDb.getUsers().length;
      productsCount = JsonDb.getProducts().length;
    }

    if (usersCount > 0 && productsCount >= 12) {
      console.log('🌱 Database already seeded.');
      return;
    }

    console.log('🌱 Seeding database...');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Seed Users
    let customer, vendor, admin;

    if (usersCount === 0) {
      customer = await UserService.create({
        name: 'Jane Doe',
        email: 'customer@rentease.com',
        passwordHash,
        role: 'customer',
        phone: '1234567890',
        address: '123 Linen Ave, Queens, NY'
      });

      vendor = await UserService.create({
        name: 'Japandi Living Co.',
        email: 'vendor@rentease.com',
        passwordHash,
        role: 'vendor',
        phone: '9876543210',
        address: '456 Clay St, Brooklyn, NY',
        businessName: 'Japandi Living Co.',
        serviceAreas: ['New York', 'Boston', 'Chicago']
      });

      admin = await UserService.create({
        name: 'RentEase Admin',
        email: 'admin@rentease.com',
        passwordHash,
        role: 'admin',
        phone: '5555555555',
        address: '789 HQ Parkway, Manhattan, NY'
      });
      console.log('✅ Default users seeded (customer@rentease.com / vendor@rentease.com / admin@rentease.com - password123)');
    } else {
      // Find existing vendor
      const users = await UserService.getAll();
      vendor = users.find(u => u.role === 'vendor');
    }

    const vendorId = vendor ? (vendor.id || vendor._id) : 'vendor_id_placeholder';

    // 2. Seed Products
    if (productsCount < 12) {
      const items: any[] = [
        {
          vendorId,
          category: 'furniture' as const,
          subCategory: 'Sofa',
          productName: 'Natsu Linen 3-Seater Sofa',
          rentPerMonth: 60,
          securityDeposit: 200,
          quantity: 10,
          availableQuantity: 10,
          images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
          description: 'A beautiful Scandi-Japanese hybrid sofa upholstered in a warm organic linen weave. Perfect for minimalist living rooms.',
          specifications: { Dimensions: '210cm x 88cm x 75cm', Color: 'Warm Oatmeal', Material: 'Solid Ash & Linen' }
        },
        {
          vendorId,
          category: 'furniture' as const,
          subCategory: 'Bed',
          productName: 'Sora Solid Oak Platform Bed',
          rentPerMonth: 45,
          securityDeposit: 150,
          quantity: 8,
          availableQuantity: 8,
          images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'],
          description: 'Low-profile solid oak platform bed embodying Japandi Zen style. Features slatted support and tapered legs.',
          specifications: { Dimensions: 'Queen (160cm x 205cm)', Color: 'Natural Oak', Material: 'Solid Oak' }
        },
        {
          vendorId,
          category: 'furniture' as const,
          subCategory: 'Dining Table',
          productName: 'Kiri Beechwood Dining Table',
          rentPerMonth: 35,
          securityDeposit: 120,
          quantity: 6,
          availableQuantity: 6,
          images: ['https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80'],
          description: 'Rectangular dining table in solid beechwood with organic wood grains and smooth radius rounded corners.',
          specifications: { Dimensions: '150cm x 80cm x 75cm', Capacity: '6 Seater', Material: 'Solid Beechwood' }
        },
        {
          vendorId,
          category: 'furniture' as const,
          subCategory: 'Chair',
          productName: 'Moku Ergonomic Desk Chair',
          rentPerMonth: 15,
          securityDeposit: 50,
          quantity: 15,
          availableQuantity: 15,
          images: ['https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=800&q=80'],
          description: 'Warm wood-accented office chair with premium mesh back support and flexible adjustments.',
          specifications: { Height: 'Adjustable 90-105cm', Support: 'Lumbar Support', Frame: 'Beechwood Veneer' }
        },
        {
          vendorId,
          category: 'appliances' as const,
          subCategory: 'Refrigerator',
          productName: 'Fuyu 350L Double Door Refrigerator',
          rentPerMonth: 50,
          securityDeposit: 250,
          quantity: 5,
          availableQuantity: 5,
          images: ['https://images.unsplash.com/photo-1571175482282-4b38d6df955b?auto=format&fit=crop&w=800&q=80'],
          description: 'Energy-efficient frost-free double door refrigerator with smart inverter technology. Low noise, premium silver finish.',
          specifications: { Capacity: '350 Liters', Rating: '5-Star Energy Saved', Finish: 'Brushed Platinum Steel' }
        },
        {
          vendorId,
          category: 'appliances' as const,
          subCategory: 'Washing Machine',
          productName: 'Arai 8kg Front Load Smart Washer',
          rentPerMonth: 40,
          securityDeposit: 200,
          quantity: 7,
          availableQuantity: 7,
          images: ['https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80'],
          description: 'Smart washing machine with steam wash and silent inverter motor. Includes quick-wash features.',
          specifications: { Capacity: '8.0 kg', SpinSpeed: '1200 RPM', Tech: 'Smart Wi-Fi Connected' }
        },
        {
          vendorId,
          category: 'appliances' as const,
          subCategory: 'Television',
          productName: 'Haru 55" 4K HDR Smart TV',
          rentPerMonth: 55,
          securityDeposit: 300,
          quantity: 6,
          availableQuantity: 6,
          images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80'],
          description: 'Stunning 4K Ultra HD TV with deep contrasts and built-in premium streaming platforms.',
          specifications: { Resolution: '4K UHD (3840 x 2160)', Sound: 'Dolby Atmos 40W', Ports: '4x HDMI 2.1' }
        },
        {
          vendorId,
          category: 'appliances' as const,
          subCategory: 'Microwave',
          productName: 'Sumo 28L Convection Microwave',
          rentPerMonth: 18,
          securityDeposit: 80,
          quantity: 12,
          availableQuantity: 12,
          images: ['https://images.unsplash.com/photo-1574269661728-5a2a890998a2?auto=format&fit=crop&w=800&q=80'],
          description: 'Compact multi-functional convection microwave with smart auto-cook menus for quick meals.',
          specifications: { Capacity: '28 Liters', Modes: 'Bake, Grill, Solo', Power: '900 Watts' }
        },
        {
          vendorId,
          category: 'furniture' as const,
          subCategory: 'Study Table',
          productName: 'Kumo Adjustable Study Table',
          rentPerMonth: 12,
          securityDeposit: 40,
          quantity: 15,
          availableQuantity: 15,
          images: ['https://images.unsplash.com/photo-1530018607912-eff2df114f11?auto=format&fit=crop&w=800&q=80'],
          description: 'Minimalist study desk featuring built-in cable management and heights adjustments. Ideal for students and remote office work.',
          specifications: { Dimensions: '120cm x 60cm x 75cm', Height: 'Adjustable 70-85cm', Material: 'Solid Pine Wood' }
        },
        {
          vendorId,
          category: 'furniture' as const,
          subCategory: 'Wardrobe',
          productName: 'Nara Oak Double Wardrobe',
          rentPerMonth: 30,
          securityDeposit: 100,
          quantity: 6,
          availableQuantity: 6,
          images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80'],
          description: 'Elegant double door wardrobe crafted from natural oak. Features smooth sliding doors and spacious interior shelves.',
          specifications: { Dimensions: '180cm x 120cm x 60cm', Style: 'Sliding Doors', Material: 'Solid Oak' }
        },
        {
          vendorId,
          category: 'appliances' as const,
          subCategory: 'Air Conditioner',
          productName: 'Suzuku Smart Split Air Conditioner',
          rentPerMonth: 45,
          securityDeposit: 200,
          quantity: 8,
          availableQuantity: 8,
          images: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80'],
          description: 'Energy-saving 1.5 ton split air conditioner with smart Wi-Fi controls, silent sleep mode, and clean air filtration.',
          specifications: { Capacity: '1.5 Ton', Rating: '5-Star Inverter', NoiseLevel: '28 dB' }
        },
        {
          vendorId,
          category: 'appliances' as const,
          subCategory: 'Water Purifier',
          productName: 'Mizu RO Smart Water Purifier',
          rentPerMonth: 15,
          securityDeposit: 60,
          quantity: 10,
          availableQuantity: 10,
          images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
          description: 'Multi-stage RO + UV water purifier with TDS controller. Delivers pristine drinking water with zero mineral loss.',
          specifications: { Capacity: '8 Liters', Tech: 'RO + UV + MTDS', Power: '60 Watts' }
        }
      ];

      // Re-seed products by clearing existing ones first to avoid duplicates
      if (JsonDb.isMongoActive) {
        await Product.deleteMany({});
      } else {
        JsonDb.saveProducts([]);
      }

      for (const item of items) {
        await ProductService.create(item);
      }
      console.log('✅ Default products seeded.');
    }

    console.log('🌱 Seeding finished successfully.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
