import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Eye, EyeOff, Edit3 } from 'lucide-react';
import api from '../api';

const Sections = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [editingSection, setEditingSection] = useState(null);
    const [editContent, setEditContent] = useState('');

    const fetchSections = () => {
        api.get('/sections').then(res => {
            setSections(res.data);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const items = Array.from(sections);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        // Update local state for immediate feedback
        setSections(items);
        
        // Update order in DB
        try {
            for (let i = 0; i < items.length; i++) {
                await api.put(`/sections/${items[i].id}`, { order: i + 1 });
            }
            setMsg('Sections reordered successfully.');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            alert('Failed to reorder sections');
        }
    };

    const toggleVisibility = async (id, isVisible) => {
        try {
            await api.put(`/sections/${id}`, { isVisible: !isVisible });
            setMsg(`Section ${!isVisible ? 'published' : 'hidden'} successfully.`);
            fetchSections();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            alert('Error updating section');
        }
    };

    const openEdit = (section) => {
        setEditingSection(section);
        setEditContent(section.content || '{}');
    };

    const handleSaveEdit = async () => {
        try {
            // Verify it's valid JSON for safety
            JSON.parse(editContent);
            await api.put(`/sections/${editingSection.id}`, { content: editContent });
            setMsg('Section content updated successfully.');
            setEditingSection(null);
            fetchSections();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            alert('Invalid JSON content. Please format properly.');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading sections...</div>;

    return (
        <div className="sections-page">
            <div className="flex-between mb-4">
                <div>
                    <h1 className="page-title">Homepage Sections</h1>
                    <p className="page-subtitle" style={{ margin: 0 }}>Manage the content and appearance of every homepage section.</p>
                </div>
            </div>
            
            {msg && <div style={{ background: 'var(--green-bg)', color: 'var(--status-green)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 500 }}>{msg}</div>}

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="sections">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} style={{ maxWidth: '800px' }}>
                            {sections.map((section, index) => (
                                <Draggable key={section.id.toString()} draggableId={section.id.toString()} index={index}>
                                    {(provided) => (
                                        <div 
                                            className="admin-card"
                                            ref={provided.innerRef} 
                                            {...provided.draggableProps} 
                                            style={{ 
                                                userSelect: 'none', padding: '1rem 1.5rem', margin: '0 0 1rem 0', 
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                ...provided.draggableProps.style
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div {...provided.dragHandleProps} style={{ color: 'var(--main-text-secondary)', cursor: 'grab', display: 'flex' }}>
                                                    <GripVertical size={20} />
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, color: 'var(--main-text)', fontSize: '1rem' }}>{section.name}</h3>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--main-text-secondary)' }}>ID: {section.sectionId}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <span className={`badge ${section.isVisible ? 'badge-success' : 'badge-gray'}`}>
                                                    {section.isVisible ? 'Published' : 'Hidden'}
                                                </span>
                                                <button 
                                                    onClick={() => toggleVisibility(section.id, section.isVisible)}
                                                    className="btn btn-ghost"
                                                    title={section.isVisible ? 'Hide' : 'Publish'}
                                                >
                                                    {section.isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                                <button onClick={() => openEdit(section)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                                                    <Edit3 size={16} /> Edit Content
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Edit Modal */}
            {editingSection && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="admin-card" style={{ width: '600px', maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Edit: {editingSection.name}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--main-text-secondary)', marginBottom: '1.5rem' }}>Edit the JSON data that powers this section. Be careful not to break the format.</p>
                        
                        <textarea 
                            value={editContent} 
                            onChange={e => setEditContent(e.target.value)} 
                            className="form-control"
                            style={{ flex: 1, minHeight: '300px', fontFamily: 'monospace', fontSize: '14px', background: 'var(--main-bg)' }}
                        ></textarea>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setEditingSection(null)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleSaveEdit} className="btn btn-gold">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sections;
