"use client";

import React, { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ServiceEditor } from '@/components/admin/ServiceEditor';
import { Service } from '@/components/booking/ServiceSelection';
import { DateBlocker } from '@/components/admin/DateBlocker';
import { FAQManager } from '@/components/admin/FAQManager';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { TeamManager } from '@/components/admin/TeamManager';
import { BookingList } from '@/components/admin/BookingList';
import { ReviewManager } from '@/components/admin/ReviewManager';
import { ExpenseManager } from '@/components/admin/ExpenseManager';

export default function AdminPage() {
    const { services, businessPhone, adminPin, updateServices, updatePhone } = useConfig();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [showServices, setShowServices] = useState(false);
    const [phoneInput, setPhoneInput] = useState(businessPhone);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [creatingInCategory, setCreatingInCategory] = useState<string | null>(null);

    // Synchronize local input with context value when it loads
    React.useEffect(() => {
        setPhoneInput(businessPhone);
    }, [businessPhone]);

    // Auto-show services if editing or creating
    React.useEffect(() => {
        if (editingService || isCreating) {
            setShowServices(true);
        }
    }, [editingService, isCreating]);

    // Persist Session
    React.useEffect(() => {
        const savedSession = sessionStorage.getItem('admin_authenticated');
        if (savedSession === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput === adminPin) {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin_authenticated', 'true');
        } else {
            alert('PIN Incorrecto');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_authenticated');
    };

    const handleSaveService = (service: Service) => {
        if (editingService) {
            updateServices(services.map(s => s.id === service.id ? service : s));
        } else {
            updateServices([...services, service]);
        }
        setEditingService(null);
        setIsCreating(false);
        setCreatingInCategory(null);
    };

    const handleDeleteService = (id: string) => {
        if (confirm('¿Seguro que quieres eliminar este servicio?')) {
            updateServices(services.filter(s => s.id !== id));
            setShowServices(true);
        }
    };

    // Group services by category
    const servicesByCategory = services.reduce((acc, s) => {
        const cat = s.category || 'Otros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s);
        return acc;
    }, {} as Record<string, Service[]>);

    const toggleCategory = (cat: string) => {
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
                <Card className="max-w-sm w-full">
                    <h1 className="text-2xl font-bold text-center mb-6">Acceso Admin</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Ingrese PIN"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-center text-2xl tracking-widest"
                            value={pinInput}
                            onChange={e => setPinInput(e.target.value)}
                            autoFocus
                        />
                        <Button fullWidth type="submit">Ingresar</Button>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 p-4 md:p-12 pb-32">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <h1 className="text-4xl font-serif font-bold text-stone-800">Panel de Control</h1>
                    <Button variant="goldOutline" onClick={handleLogout} className="px-10 !rounded-none py-2 text-[12px]">SALIR</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Agenda - Full Width Top Row */}
                    <div className="md:col-span-12 animate-in fade-in duration-700">
                        <BookingList />
                    </div>

                    {/* Left Column */}
                    <div className="md:col-span-7 space-y-12">
                        {/* Servicios */}
                        <Card>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-stone-800">Servicios</h2>
                                    <button
                                        onClick={() => setShowServices(!showServices)}
                                        className="text-[#3b82f6] hover:underline text-[10px] font-bold uppercase flex items-center gap-1 mt-2"
                                    >
                                        <span>{showServices ? '▼' : '▶'}</span> VER TODOS
                                    </button>
                                </div>
                                <Button variant="gold" onClick={() => { setEditingService(null); setIsCreating(true); }}>
                                    + NUEVO
                                </Button>
                            </div>

                            {(isCreating || editingService) && (
                                <div className="mb-8 border-b border-stone-100 pb-8 animate-in slide-in-from-top-4">
                                    <ServiceEditor
                                        initialService={editingService}
                                        defaultCategory={creatingInCategory || undefined}
                                        onSave={handleSaveService}
                                        onCancel={() => { setIsCreating(false); setEditingService(null); setCreatingInCategory(null); }}
                                    />
                                </div>
                            )}

                            {showServices && (
                                <div className="grid grid-cols-1 gap-8">
                                    {Object.entries(servicesByCategory).map(([category, items]) => {
                                        const isOpen = openCategories[category] ?? false;
                                        return (
                                            <div key={category} className="space-y-4">
                                                <div
                                                    className="flex items-center justify-between cursor-pointer group/cat"
                                                    onClick={() => toggleCategory(category)}
                                                >
                                                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-tighter flex items-center gap-2">
                                                        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                                                        {category}
                                                    </h3>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingService(null);
                                                            setIsCreating(true);
                                                            setCreatingInCategory(category);
                                                        }}
                                                        className="text-[10px] font-bold text-[#8B7023] hover:text-[#C5A02E] transition-colors uppercase"
                                                    >
                                                        + NUEVO EN {category}
                                                    </button>
                                                </div>

                                                {isOpen && (
                                                    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {items.map(service => (
                                                            <div key={service.id} className="bg-stone-50 p-5 rounded-2xl border border-stone-100 hover:bg-white hover:border-gold-200 hover:shadow-sm transition-all group">
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <h4 className="font-serif font-bold text-lg text-stone-800 tracking-tight">{service.name}</h4>
                                                                        <p className="text-[#C5A02E] font-bold text-sm mt-0.5">€{service.price.toLocaleString()}</p>
                                                                    </div>
                                                                    <div className="flex gap-4 transition-opacity">
                                                                        <button
                                                                            onClick={() => { setEditingService(service); setIsCreating(false); }}
                                                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                                                                        >
                                                                            Editar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteService(service.id)}
                                                                            className="text-xs font-bold text-red-600 hover:text-red-800 uppercase tracking-widest"
                                                                        >
                                                                            Borrar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>

                        {/* Gastos */}
                        <ExpenseManager />

                        {/* Equipo */}
                        <TeamManager />

                        {/* Bloquear Fechas */}
                        <DateBlocker />

                        {/* Contacto */}
                        <Card>
                            <h2 className="text-2xl font-serif font-bold mb-8 text-[#C5A02E]">Contacto</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">WhatsApp del Negocio</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={phoneInput}
                                            onChange={e => setPhoneInput(e.target.value)}
                                            className="flex-1 px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 outline-none focus:border-[#C5A02E]/50"
                                            placeholder="549351..."
                                        />
                                        <Button variant="gold" onClick={() => { updatePhone(phoneInput); alert('¡Número Guardado!'); }}>
                                            GUARDAR
                                        </Button>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-stone-100 space-y-2">
                                        <p className="text-xs text-stone-400 font-medium italic">Herramientas para el equipo:</p>
                                        <a
                                            href="/staff"
                                            className="text-sm text-[#C5A02E] font-bold hover:underline"
                                        >
                                            Ir al Portal de Profesionales →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-5 space-y-12">
                        <ReviewManager />
                        <GalleryManager />
                        <FAQManager />
                    </div>
                </div>
            </div>
        </div>
    );
}
