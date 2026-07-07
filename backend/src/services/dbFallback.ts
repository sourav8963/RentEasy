import fs from 'fs';
import path from 'path';

// Define the root folder for JSON data storage
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read and write files
function readJSON<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${filename}.json, returning empty list.`, err);
    return [];
  }
}

function writeJSON<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const JsonDb = {
  // Flag to represent if MongoDB is used or JSON files
  isMongoActive: false,

  // Users CRUD
  getUsers(): any[] {
    return readJSON('users');
  },
  saveUsers(users: any[]): void {
    writeJSON('users', users);
  },

  // Products CRUD
  getProducts(): any[] {
    return readJSON('products');
  },
  saveProducts(products: any[]): void {
    writeJSON('products', products);
  },

  // Rentals CRUD
  getRentals(): any[] {
    return readJSON('rentals');
  },
  saveRentals(rentals: any[]): void {
    writeJSON('rentals', rentals);
  },

  // Maintenance CRUD
  getMaintenance(): any[] {
    return readJSON('maintenance');
  },
  saveMaintenance(maintenance: any[]): void {
    writeJSON('maintenance', maintenance);
  }
};
