import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import api from './api';
import './admin.css';
import { LayoutDashboard, ShoppingBag, FolderTree, Image as ImageIcon, Settings, Building2, Phone, Truck, LogOut, Menu, ExternalLink } from 'lucide-react';

// Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductEditor = React.lazy(() => import('./pages/ProductEditor'));
const Media = React.lazy(() => import('./pages/Media'));
const Sections = React.lazy(() => import('./pages/Sections'));
const BusinessSettings = React.lazy(() => import('./pages/BusinessSettings'));

const Login = ({ setAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', { email, password });
            if(res.data.success) {
                localStorage.setItem('admin_token', res.data.token);
                setAuth(true);
                navigate('/admin');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <form onSubmit={handleLogin} className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src="/assets/logo.png" alt="RK Steel Furniture Logo" style={{ width: '52px', height: '52px', objectFit: 'contain', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
                    <h1 style={{ color: '#D4AF37', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.25rem' }}>RK STEEL FURNITURE</h1>
                    <p style={{ color: '#888888', fontSize: '0.8125rem' }}>Admin Panel</p>
                </div>
                {error && <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}
                <div className="form-group">
                    <label className="form-label" style={{ color: '#cccccc' }}>Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-control" placeholder="admin@rksteel.com" style={{ background: '#2a2a2a', color: '#ffffff', borderColor: '#444444' }} />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ color: '#cccccc' }}>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-control" placeholder="••••••••" style={{ background: '#2a2a2a', color: '#ffffff', borderColor: '#444444' }} />
                </div>
                <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem' }}>Login to Dashboard</button>
            </form>
        </div>
    );
};

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    const handleLogout = () => {
        api.post('/logout').finally(() => {
            localStorage.removeItem('admin_token');
            window.location.href = '/admin/login';
        });
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
        return (
            <Link
                to={to}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
                style={{ color: '#ffffff' }}
            >
                <Icon size={18} style={{ flexShrink: 0 }} /> {label}
            </Link>
        );
    };

    // Get current page title for the header
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/admin' || path === '/admin/') return 'Dashboard';
        if (path.includes('/products/new')) return 'Add Product';
        if (path.includes('/products/edit')) return 'Edit Product';
        if (path.includes('/products')) return 'Products';
        if (path.includes('/media')) return 'Media Library';
        if (path.includes('/sections')) return 'Homepage Sections';
        if (path.includes('/settings')) return 'Business Settings';
        return 'Dashboard';
    };

    return (
        <div className="admin-layout">
            {/* Mobile overlay — closes sidebar when tapped */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={closeSidebar}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src="/assets/logo.png" alt="RK Steel Furniture" className="sidebar-logo" />
                    <span className="sidebar-brand">RK STEEL</span>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-section-title">Main</div>
                    <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />

                    <div className="nav-section-title">Website</div>
                    <NavItem to="/admin/sections" icon={FolderTree} label="Homepage Sections" />

                    <div className="nav-section-title">Catalog</div>
                    <NavItem to="/admin/products" icon={ShoppingBag} label="Products" />
                    <NavItem to="/admin/media" icon={ImageIcon} label="Media Library" />

                    <div className="nav-section-title">Business</div>
                    <NavItem to="/admin/settings" icon={Building2} label="Settings" />

                    {/* Footer links */}
                    <div className="nav-footer">
                        <a
                            href="/"
                            target="_blank"
                            rel="noreferrer"
                            className="nav-item"
                            style={{ color: '#ffffff' }}
                            onClick={closeSidebar}
                        >
                            <ExternalLink size={18} style={{ flexShrink: 0 }} /> View Website
                        </a>
                        <button
                            onClick={handleLogout}
                            className="nav-item nav-danger"
                            style={{ fontFamily: 'inherit', fontSize: '0.875rem' }}
                        >
                            <LogOut size={18} style={{ flexShrink: 0 }} /> Logout
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main content */}
            <main className="admin-main">
                <header className="top-header">
                    <div className="header-left">
                        {/* Hamburger — only shown on mobile via CSS */}
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle menu"
                        >
                            <Menu size={22} />
                        </button>
                        <h1 className="header-title">{getPageTitle()}</h1>
                    </div>
                    <div className="header-actions">
                        <span className="header-admin-badge">Admin</span>
                    </div>
                </header>
                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

// Main App Router
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/me')
            .then(() => setIsAuthenticated(true))
            .catch(() => setIsAuthenticated(false))
            .finally(() => setLoading(false));
    }, []);

    if(loading) return <div className="admin-loading">Loading...</div>;

    return (
        <Router>
            <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
                <Routes>
                    <Route path="/admin/login" element={<Login setAuth={setIsAuthenticated} />} />
                    <Route path="/admin/*" element={
                        isAuthenticated ? (
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/products" element={<Products />} />
                                    <Route path="/products/new" element={<ProductEditor />} />
                                    <Route path="/products/edit/:id" element={<ProductEditor />} />
                                    <Route path="/media" element={<Media />} />
                                    <Route path="/sections" element={<Sections />} />
                                    <Route path="/settings" element={<BusinessSettings />} />
                                </Routes>
                            </Layout>
                        ) : <Navigate to="/admin/login" />
                    } />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
