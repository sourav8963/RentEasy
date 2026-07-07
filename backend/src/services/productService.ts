import Product, { IProduct } from '../models/Product';
import { JsonDb } from './dbFallback';
import mongoose from 'mongoose';

export interface ProductFilters {
  category?: string;
  subCategory?: string;
  search?: string;
  sort?: string; // 'rent-asc' | 'rent-desc' | 'name-asc' | 'name-desc'
}

export const ProductService = {
  async getAll(filters: ProductFilters): Promise<any[]> {
    if (JsonDb.isMongoActive) {
      const query: any = {};
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.subCategory) {
        query.subCategory = filters.subCategory;
      }
      if (filters.search) {
        query.productName = { $regex: filters.search, $options: 'i' };
      }

      let sortQuery: any = {};
      if (filters.sort === 'rent-asc') {
        sortQuery.rentPerMonth = 1;
      } else if (filters.sort === 'rent-desc') {
        sortQuery.rentPerMonth = -1;
      } else if (filters.sort === 'name-asc') {
        sortQuery.productName = 1;
      } else if (filters.sort === 'name-desc') {
        sortQuery.productName = -1;
      }

      return await Product.find(query).sort(sortQuery).populate('vendorId', 'name email businessName');
    } else {
      let products = JsonDb.getProducts();

      // Filter by category
      if (filters.category) {
        products = products.filter(p => p.category === filters.category);
      }
      // Filter by subCategory
      if (filters.subCategory) {
        products = products.filter(p => p.subCategory?.toLowerCase() === filters.subCategory?.toLowerCase());
      }
      // Filter by search term
      if (filters.search) {
        const s = filters.search.toLowerCase();
        products = products.filter(p => p.productName.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
      }

      // Populate vendor name/email mock
      const users = JsonDb.getUsers();
      products = products.map(p => {
        const vendor = users.find(u => u.id === p.vendorId || u._id === p.vendorId);
        return {
          ...p,
          vendorId: vendor ? { _id: vendor.id || vendor._id, name: vendor.name, email: vendor.email, businessName: vendor.businessName } : p.vendorId
        };
      });

      // Sort products
      if (filters.sort === 'rent-asc') {
        products.sort((a, b) => a.rentPerMonth - b.rentPerMonth);
      } else if (filters.sort === 'rent-desc') {
        products.sort((a, b) => b.rentPerMonth - a.rentPerMonth);
      } else if (filters.sort === 'name-asc') {
        products.sort((a, b) => a.productName.localeCompare(b.productName));
      } else if (filters.sort === 'name-desc') {
        products.sort((a, b) => b.productName.localeCompare(a.productName));
      }

      return products;
    }
  },

  async findById(id: string): Promise<any | null> {
    if (JsonDb.isMongoActive) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await Product.findById(id).populate('vendorId', 'name email businessName');
    } else {
      const products = JsonDb.getProducts();
      const p = products.find(prod => prod.id === id || prod._id === id);
      if (!p) return null;

      const users = JsonDb.getUsers();
      const vendor = users.find(u => u.id === p.vendorId || u._id === p.vendorId);
      return {
        ...p,
        vendorId: vendor ? { _id: vendor.id || vendor._id, name: vendor.name, email: vendor.email, businessName: vendor.businessName } : p.vendorId
      };
    }
  },

  async create(productData: Partial<IProduct>): Promise<any> {
    if (JsonDb.isMongoActive) {
      const newProduct = new Product(productData);
      return await newProduct.save();
    } else {
      const products = JsonDb.getProducts();
      const newId = new mongoose.Types.ObjectId().toString();
      const newProduct = {
        id: newId,
        _id: newId,
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      products.push(newProduct);
      JsonDb.saveProducts(products);
      return newProduct;
    }
  },

  async update(id: string, updateData: any): Promise<any | null> {
    if (JsonDb.isMongoActive) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await Product.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const products = JsonDb.getProducts();
      const idx = products.findIndex(p => p.id === id || p._id === id);
      if (idx === -1) return null;
      products[idx] = { ...products[idx], ...updateData, updatedAt: new Date() };
      JsonDb.saveProducts(products);
      return products[idx];
    }
  },

  async delete(id: string): Promise<boolean> {
    if (JsonDb.isMongoActive) {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const res = await Product.findByIdAndDelete(id);
      return res !== null;
    } else {
      const products = JsonDb.getProducts();
      const idx = products.findIndex(p => p.id === id || p._id === id);
      if (idx === -1) return false;
      products.splice(idx, 1);
      JsonDb.saveProducts(products);
      return true;
    }
  }
};
