"use client";

import React, { useState, useMemo } from 'react';
import { useConfig, Booking } from '@/context/ConfigContext';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/date-helpers';
import { EditBookingModal } from './EditBookingModal';

interface ClientData {
    name: string;
    phone: string;
    totalVisits: number;
    totalSpent: number;
    lastVisit: string | null;
    lastService: string | null;
    pastBookings: Booking[];
    futureBookings: Booking[];
}

export function ClientSearch() {
    const { bookings, team } = useConfig();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

    // Helper to open edit modal with phone normalization
    const handleEditClick = (booking: Booking) => {
        let phone = booking.clientPhone || '';
        if (phone && !phone.includes('+')) {
            phone = `+34 ${phone}`;
        }
        setEditingBooking({ ...booking, clientPhone: phone });
    };

    // Normalize phone for comparison (remove spaces, dashes, and country code prefix)
    const normalizePhone = (phone: string): string => {
        return phone.replace(/[\s\-\+]/g, '').toLowerCase();
    };

    // Search clients based on query
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase().trim();
        const normalizedQuery = normalizePhone(searchQuery);

        // Group bookings by client (phone + name combination)
        const clientMap = new Map<string, ClientData>();

        bookings.forEach(booking => {
            const clientKey = `${booking.clientPhone}_${booking.clientName}`;
            const normalizedPhone = normalizePhone(booking.clientPhone || '');

            // Check if booking matches search query
            const matchesName = booking.clientName.toLowerCase().includes(query);
            const matchesPhone = normalizedPhone.includes(normalizedQuery);

            if (matchesName || matchesPhone) {
                if (!clientMap.has(clientKey)) {
                    clientMap.set(clientKey, {
                        name: booking.clientName,
                        phone: booking.clientPhone,
                        totalVisits: 0,
                        totalSpent: 0,
                        lastVisit: null,
                        lastService: null,
                        pastBookings: [],
                        futureBookings: []
                    });
                }

                const client = clientMap.get(clientKey)!;
                const bookingDate = new Date(booking.date);
                const now = new Date();

                // Categorize booking
                if (booking.status === 'attended') {
                    client.pastBookings.push(booking);
                    client.totalVisits++;
                    client.totalSpent += booking.price || 0;

                    // Update last visit
                    if (!client.lastVisit || new Date(booking.date) > new Date(client.lastVisit)) {
                        client.lastVisit = booking.date;
                        client.lastService = booking.serviceName;
                    }
                } else if (bookingDate >= now && (booking.status === 'pending' || booking.status === 'confirmed')) {
                    client.futureBookings.push(booking);
                }
            }
        });

        // Sort bookings by date
        clientMap.forEach(client => {
            client.pastBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            client.futureBookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });

        return Array.from(clientMap.values());
    }, [searchQuery, bookings]);

    const getProfessionalName = (id?: string) => {
        if (!id) return 'Sin Asignar';
        const member = team.find(m => m.id === id);
        return member ? member.name : 'Desconocido';
    };

    const statusColors = {
        pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
        confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        attended: 'bg-blue-50 text-blue-600 border-blue-100',
        absent: 'bg-red-50 text-red-600 border-red-100',
    };

    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-stone-800 mb-4">
                    Buscar Cliente
                </h2>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedClient(null);
                        }}
                        placeholder="Buscar por nombre o teléfono..."
                        className="w-full px-4 py-3 pl-12 rounded-xl border border-stone-200 outline-none focus:border-gold-300 text-stone-700"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-xl">
                        🔍
                    </span>
                </div>
                <p className="text-xs text-stone-400 mt-2">
                    Escribe el nombre o número de teléfono del cliente para ver su historial
                </p>
            </div>

            {/* Search Results */}
            {searchQuery.trim() && searchResults.length > 0 && !selectedClient && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-stone-400 uppercase mb-3">
                        Resultados ({searchResults.length})
                    </h3>
                    <div className="space-y-2">
                        {searchResults.map((client, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedClient(client)}
                                className="w-full text-left p-4 bg-white border border-stone-100 rounded-xl hover:border-gold-200 transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-stone-700">{client.name}</h4>
                                        <p className="text-sm text-stone-400 font-mono">{client.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-stone-400">Visitas</p>
                                        <p className="text-lg font-bold text-stone-700">{client.totalVisits}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* No Results */}
            {searchQuery.trim() && searchResults.length === 0 && (
                <div className="text-center py-12 bg-stone-50 rounded-xl border-2 border-dashed border-stone-100">
                    <p className="text-stone-400 italic">No se encontraron clientes con ese nombre o teléfono</p>
                </div>
            )}

            {/* Client Details */}
            {selectedClient && (
                <div className="animate-in slide-in-from-top-4">
                    <button
                        onClick={() => setSelectedClient(null)}
                        className="text-sm text-stone-400 hover:text-stone-600 mb-4 flex items-center gap-1"
                    >
                        ← Volver a resultados
                    </button>

                    {/* Client Header */}
                    <div className="bg-gradient-to-br from-gold-50 to-stone-50 p-6 rounded-2xl border border-gold-100 mb-6">
                        <h3 className="text-2xl font-serif font-bold text-stone-800 mb-2">
                            {selectedClient.name}
                        </h3>
                        <p className="text-stone-500 font-mono mb-4">📞 {selectedClient.phone}</p>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-stone-100">
                                <p className="text-xs text-stone-400 uppercase font-bold mb-1">Total Visitas</p>
                                <p className="text-2xl font-bold text-stone-700">{selectedClient.totalVisits}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-stone-100">
                                <p className="text-xs text-stone-400 uppercase font-bold mb-1">Gasto Total</p>
                                <p className="text-2xl font-bold text-emerald-600">€{selectedClient.totalSpent.toFixed(2)}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-stone-100">
                                <p className="text-xs text-stone-400 uppercase font-bold mb-1">Última Visita</p>
                                <p className="text-sm font-bold text-stone-700">
                                    {selectedClient.lastVisit ? formatDate(selectedClient.lastVisit) : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-stone-100">
                                <p className="text-xs text-stone-400 uppercase font-bold mb-1">Último Servicio</p>
                                <p className="text-xs font-bold text-stone-700 line-clamp-2">
                                    {selectedClient.lastService || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Future Bookings */}
                    {selectedClient.futureBookings.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-stone-400 uppercase mb-3 flex items-center gap-2">
                                📅 Turnos Futuros ({selectedClient.futureBookings.length})
                            </h4>
                            <div className="space-y-3">
                                {selectedClient.futureBookings.map(booking => (
                                    <div
                                        key={booking.id}
                                        className="bg-white border border-stone-100 p-4 rounded-xl"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h5 className="font-bold text-stone-700">{booking.serviceName}</h5>
                                                <p className="text-sm text-stone-500">{getProfessionalName(booking.professionalId)}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusColors[booking.status as keyof typeof statusColors]}`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-stone-400">
                                            <span>📅 {formatDate(booking.date)} • {booking.time}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">€{booking.price?.toLocaleString()}</span>
                                                <button
                                                    onClick={() => handleEditClick(booking)}
                                                    className="p-1 hover:text-gold-500 text-stone-300 transition-colors"
                                                    title="Editar Reserva"
                                                >
                                                    ✏️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Bookings */}
                    {selectedClient.pastBookings.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-stone-400 uppercase mb-3 flex items-center gap-2">
                                📋 Historial de Turnos ({selectedClient.pastBookings.length})
                            </h4>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedClient.pastBookings.map(booking => (
                                    <div
                                        key={booking.id}
                                        className="bg-stone-50 border border-stone-100 p-4 rounded-xl"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h5 className="font-bold text-stone-700">{booking.serviceName}</h5>
                                                <p className="text-sm text-stone-500">{getProfessionalName(booking.professionalId)}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusColors.attended}`}>
                                                ATENDIDO
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-stone-400">
                                            <span>📅 {formatDate(booking.date)} • {booking.time}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">€{booking.price?.toLocaleString()}</span>
                                                <button
                                                    onClick={() => handleEditClick(booking)}
                                                    className="p-1 hover:text-gold-500 text-stone-300 transition-colors"
                                                    title="Editar Reserva"
                                                >
                                                    ✏️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No History */}
                    {selectedClient.pastBookings.length === 0 && selectedClient.futureBookings.length === 0 && (
                        <div className="text-center py-12 bg-stone-50 rounded-xl border-2 border-dashed border-stone-100">
                            <p className="text-stone-400 italic">Este cliente no tiene turnos registrados</p>
                        </div>
                    )}
                </div>
            )}

            {editingBooking && (
                <EditBookingModal
                    booking={editingBooking}
                    onClose={() => setEditingBooking(null)}
                />
            )}
        </Card>
    );
}
