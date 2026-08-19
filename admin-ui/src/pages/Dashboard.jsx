import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, Eye, EyeOff, Image as ImageIcon, LayoutTemplate,
    PlusCircle, Settings, Edit3, RefreshCw, Tag, TrendingUp
} from 'lucide-react';
import api from '../api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentProducts, setRecentProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDashboard = useCallback(() => {
        setLoading(true);
        setError('');
        Promise.all([
            api.get('/stats'),
            api.get('/products'),
        ]).then(([statsRes, productsRes]) => {
            const statsData = statsRes.data || {};
            const allProducts = Array.isArray(productsRes.data) ? productsRes.data : [];

            // Compute additional stats from products list
            const draftCount = allProducts.filter(p => p.status === 'draft' || p.status === 'hidden').length;
            const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];

            setStats({
                totalProducts: statsData.totalProducts ?? allProducts.length,
                publishedProducts: statsData.publishedProducts ?? allProducts.filter(p => p.status === 'published').length,
                draftProducts: draftCount,
                totalCategories: uniqueCategories.length,
                totalMedia: statsData.totalMedia ?? 0,
            });
            setCategories(uniqueCategories);
            // Sort by createdAt descending, take 5
            const sorted = [...allProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRecentProducts(sorted.slice(0, 6));
            setLoading(false);
        }).catch(err => {
            console.error('Dashboard load error:', err);
            const msg = err.response?.status === 401
                ? 'Session expired. Please log in again.'
                : 'Unable to load dashboard data. Please retry.';
            setError(msg);
            setLoading(false);
        });
    }, []);

    useEffect(() => { loadDashboard(); }, [loadDashboard]);

    const getImage = (p) => {
        if (p.image) return `/assets/${p.image}`;
        if (p.images) { try { return `/assets/${JSON.parse(p.images)[0]}`; } catch { return null; } }
        return null;
    };

    if (loading) return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--main-text-secondary)' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem', color: 'var(--gold)' }} />
            <p>Loading dashboard...</p>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (error) return (
        <div style={{ padding: '1rem' }}>
            <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Dashboard</h1>
            <div className="toast-error" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ flex: 1, color: '#7f1d1d' }}>{error}</span>
                <button onClick={loadDashboard} className="btn btn-gold" style={{ flexShrink: 0 }}>
                    <RefreshCw size={16} /> Retry
                </button>
            </div>
        </div>
    );

    const statCards = [
        { label: 'Total Products',    value: stats.totalProducts,    icon: Package,       color: '#D4AF37', bg: 'rgba(212,175,55,0.1)' },
        { label: 'Published',         value: stats.publishedProducts, icon: Eye,          color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        { label: 'Draft / Hidden',    value: stats.draftProducts,    icon: EyeOff,        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Categories',        value: stats.totalCategories,  icon: Tag,           color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        { label: 'Media Images',      value: stats.totalMedia,       icon: ImageIcon,     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    ];

    return (
        <div className="dashboard-page">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back! Here's an overview of your catalog and website.</p>

            {/* Stat Cards */}
            <div className="stat-grid mb-4">
                {statCards.map(card => (
                    <div key={card.label} className="admin-card stat-card">
                        <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
                            <card.icon size={22} />
                        </div>
                        <div className="stat-content">
                            <h3>{card.label}</h3>
                            <p>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--main-text)', marginBottom: '1rem' }}>Quick Actions</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <Link to="/admin/products/new" className="btn btn-gold"><PlusCircle size={16} /> Add Product</Link>
                <Link to="/admin/media" className="btn btn-outline"><ImageIcon size={16} /> Upload Image</Link>
                <Link to="/admin/sections" className="btn btn-outline"><Edit3 size={16} /> Edit Homepage</Link>
                <Link to="/admin/settings" className="btn btn-outline"><Settings size={16} /> Business Settings</Link>
            </div>

            {/* Categories breakdown */}
            {categories.length > 0 && (
                <div className="admin-card mb-4">
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--main-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={17} style={{ color: 'var(--gold)' }} /> Product Categories
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {categories.map(cat => (
                            <span key={cat} style={{ background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '999px', padding: '0.3rem 0.875rem', fontSize: '0.8125rem', color: 'var(--main-text)', fontWeight: 500 }}>
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Products Table */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="flex-between" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--main-text)' }}>Recent Products</h2>
                    <Link to="/admin/products" className="btn btn-ghost" style={{ fontSize: '0.8125rem' }}>View All →</Link>
                </div>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--main-text-secondary)' }}>
                                        <Package size={36} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                                        <p style={{ marginBottom: '0.75rem' }}>No products yet.</p>
                                        <Link to="/admin/products/new" className="btn btn-gold" style={{ fontSize: '0.875rem' }}>
                                            <PlusCircle size={15} /> Add First Product
                                        </Link>
                                    </td>
                                </tr>
                            ) : recentProducts.map(p => {
                                const imgSrc = getImage(p);
                                return (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {imgSrc ? (
                                                    <img src={imgSrc} alt={p.name}
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                                                        onError={e => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Package size={18} style={{ color: '#c0c0c0' }} />
                                                    </div>
                                                )}
                                                <div>
                                                    <span style={{ fontWeight: 600, color: 'var(--main-text)', display: 'block' }}>{p.name}</span>
                                                    {p.featured && <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Featured</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--main-text-secondary)' }}>{p.category || '—'}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--main-text)' }}>₹{p.price}</td>
                                        <td>
                                            <span className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-gray'}`}>
                                                {p.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Link to={`/admin/products/edit/${p.id}`} className="btn btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
