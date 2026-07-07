import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, SlidersHorizontal, Info, Eye } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

interface Product {
  _id: string;
  id?: string;
  productName: string;
  category: 'furniture' | 'appliances';
  subCategory: string;
  rentPerMonth: number;
  securityDeposit: number;
  quantity: number;
  availableQuantity: number;
  images: string[];
  description: string;
}

export const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read URL search params
  const categoryParam = searchParams.get('category') || '';
  const subCategoryParam = searchParams.get('subCategory') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || '';

  const [searchVal, setSearchVal] = useState(searchParam);

  const subCategories = {
    furniture: ['Bed', 'Sofa', 'Dining Table', 'Chair'],
    appliances: ['Refrigerator', 'Washing Machine', 'Television', 'Microwave']
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (categoryParam) params.category = categoryParam;
        if (subCategoryParam) params.subCategory = subCategoryParam;
        if (searchParam) params.search = searchParam;
        if (sortParam) params.sort = sortParam;

        const res = await axios.get(`${API_URL}/products`, { params });
        setProducts(res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load products. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, subCategoryParam, searchParam, sortParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchVal);
  };

  const updateParam = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    // If category changes, clear subcategory
    if (key === 'category') {
      nextParams.delete('subCategory');
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchVal('');
  };

  return (
    <div className="min-h-screen py-10 px-6 md:px-12 max-w-container-max mx-auto space-y-8 bg-background">
      {/* Top Banner Header */}
      <div className="space-y-3 text-center md:text-left">
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface">Rent Furniture & Appliances</h1>
        <p className="text-on-surface-variant text-sm max-w-xl">
          Immaculate Japandi designs, thoroughly inspected, cleaned, and delivered straight to your flat.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between border-b border-outline-variant/30 pb-6">
        {/* Category Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 lg:pb-0">
          <button
            onClick={() => updateParam('category', '')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              !categoryParam
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => updateParam('category', 'furniture')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              categoryParam === 'furniture'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            Furniture
          </button>
          <button
            onClick={() => updateParam('category', 'appliances')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              categoryParam === 'appliances'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            Appliances
          </button>
        </div>

        {/* Search & Sort Panel */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <form onSubmit={handleSearchSubmit} className="relative flex-grow sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
            />
            <Search size={18} className="absolute left-3 top-3 text-outline" />
          </form>

          <select
            value={sortParam}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="px-4 py-2.5 bg-surface border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface-variant focus:outline-none transition-colors"
          >
            <option value="">Sort: Featured</option>
            <option value="rent-asc">Price: Low to High</option>
            <option value="rent-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Filter Sidebar */}
        <div className="lg:col-span-3 bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
            <span className="font-serif text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal size={16} /> Filters
            </span>
            {(categoryParam || subCategoryParam || searchParam || sortParam) && (
              <button onClick={clearAllFilters} className="text-xs text-primary hover:underline font-semibold">
                Clear all
              </button>
            )}
          </div>

          {/* Subcategory List Filters */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sub-Categories</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => updateParam('subCategory', '')}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !subCategoryParam
                    ? 'bg-primary/5 text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                All Subcategories
              </button>

              {/* Show items based on active category toggle */}
              {(!categoryParam || categoryParam === 'furniture') &&
                subCategories.furniture.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => updateParam('subCategory', sub)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      subCategoryParam === sub
                        ? 'bg-primary/5 text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    {sub}
                  </button>
                ))}

              {(!categoryParam || categoryParam === 'appliances') &&
                subCategories.appliances.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => updateParam('subCategory', sub)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      subCategoryParam === sub
                        ? 'bg-primary/5 text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Right Side Products Grid */}
        <div className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-on-surface-variant">Loading rental items...</p>
            </div>
          ) : error ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 text-center">
              <Info size={36} className="text-error" />
              <p className="text-sm text-on-surface-variant">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="min-h-[45vh] bg-surface rounded-3xl border border-outline-variant/30 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <span className="text-5xl">🛋️</span>
              <h3 className="font-serif text-2xl text-on-surface">No products found</h3>
              <p className="text-sm text-on-surface-variant max-w-sm">
                We couldn't find any products matching your active filter criteria. Try resetting the filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg text-sm font-semibold tracking-wide shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => {
                const prodId = prod._id || prod.id;
                const isOutOfStock = prod.availableQuantity <= 0;

                return (
                  <div
                    key={prodId}
                    className="group bg-surface rounded-2xl border border-outline-variant/35 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all relative"
                  >
                    {isOutOfStock && (
                      <span className="absolute top-3 left-3 z-10 bg-error/10 text-error border border-error/25 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                        Rented Out
                      </span>
                    )}
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={prod.images[0]}
                        alt={prod.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Link
                          to={`/product/${prodId}`}
                          className="p-3 bg-surface text-primary rounded-full shadow-lg hover:scale-105 transition-transform"
                        >
                          <Eye size={20} />
                        </Link>
                      </div>
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                          {prod.category} • {prod.subCategory}
                        </span>
                        <h3 className="font-serif text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          <Link to={`/product/${prodId}`}>{prod.productName}</Link>
                        </h3>
                      </div>

                      <div className="flex justify-between items-end border-t border-outline-variant/25 pt-4">
                        <div>
                          <p className="text-xs text-on-surface-variant">Monthly Rent</p>
                          <p className="text-xl font-serif text-primary font-bold">
                            ${prod.rentPerMonth}
                            <span className="text-xs font-sans font-normal text-on-surface-variant">/mo</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-on-surface-variant">Refundable Deposit</p>
                          <p className="text-sm font-semibold text-on-surface">${prod.securityDeposit}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
