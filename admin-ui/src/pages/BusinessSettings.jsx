import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../api';

const BusinessSettings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/settings').then(res => {
            const s = {};
            res.data.forEach(item => { s[item.key] = item.value; });
            setSettings(s);
            setLoading(false);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const settingsArray = Object.keys(settings).map(key => ({ key, value: settings[key] }));
        try {
            await api.post('/settings', settingsArray);
            setMsg('Business settings updated successfully.');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            alert('Failed to save settings');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

    return (
        <div className="settings-page">
            <div className="flex-between mb-4">
                <div>
                    <h1 className="page-title">Business Settings</h1>
                    <p className="page-subtitle" style={{ margin: 0 }}>Manage your core business information and preferences.</p>
                </div>
            </div>
            
            {msg && <div className="toast-success">{msg}</div>}

            <form onSubmit={handleSave}>
                <div className="admin-card mb-4">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Brand Information</h3>
                    <div className="grid-2-col" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group mb-0">
                            <label className="form-label">Business Name</label>
                            <input type="text" name="businessName" value={settings.businessName || ''} onChange={handleChange} required className="form-control" />
                        </div>
                        <div className="form-group mb-0">
                            <label className="form-label">Logo Image (from Media)</label>
                            <input type="text" name="logo" value={settings.logo || ''} onChange={handleChange} required className="form-control" />
                        </div>
                    </div>
                    
                    <div className="grid-2-col" style={{ gap: '1.5rem' }}>
                        <div className="form-group mb-0">
                            <label className="form-label">Primary Tagline</label>
                            <input type="text" name="tagline1" value={settings.tagline1 || ''} onChange={handleChange} required className="form-control" />
                        </div>
                        <div className="form-group mb-0">
                            <label className="form-label">Secondary Tagline</label>
                            <input type="text" name="tagline2" value={settings.tagline2 || ''} onChange={handleChange} required className="form-control" />
                        </div>
                    </div>
                </div>

                <div className="admin-card mb-4">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Contact & Location</h3>
                    <div className="grid-2-col" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group mb-0">
                            <label className="form-label">Phone Number</label>
                            <input type="text" name="phone" value={settings.phone || ''} onChange={handleChange} required className="form-control" />
                        </div>
                        <div className="form-group mb-0">
                            <label className="form-label">WhatsApp Number</label>
                            <input type="text" name="whatsapp" value={settings.whatsapp || ''} onChange={handleChange} required className="form-control" />
                        </div>
                    </div>
                    
                    <div className="form-group mb-0">
                        <label className="form-label">Business Address</label>
                        <input type="text" name="location" value={settings.location || ''} onChange={handleChange} required className="form-control" />
                    </div>
                </div>

                <div className="admin-card mb-4">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Delivery Preferences</h3>
                    <div className="grid-2-col" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group mb-0">
                            <label className="form-label">Delivery Radius</label>
                            <input type="text" name="deliveryRadius" value={settings.deliveryRadius || ''} onChange={handleChange} required className="form-control" placeholder="e.g. 30 KM" />
                        </div>
                    </div>
                    
                    <div className="form-group mb-0" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <input type="checkbox" name="freeDelivery" id="freeDelivery" checked={settings.freeDelivery === 'true'} onChange={(e) => handleChange({ target: { name: 'freeDelivery', value: e.target.checked ? 'true' : 'false' } })} style={{ width: '1.25rem', height: '1.25rem' }} />
                        <div>
                            <label htmlFor="freeDelivery" style={{ fontWeight: 600, display: 'block', cursor: 'pointer' }}>Enable Free Delivery Badge</label>
                            <small style={{ color: 'var(--main-text-secondary)' }}>Display "Free Delivery within X KM" across the website.</small>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-gold" style={{ padding: '0.75rem 2rem' }}>
                        <Save size={18} /> Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BusinessSettings;
