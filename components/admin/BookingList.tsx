"use client";

import React, { useState } from 'react';
import { useConfig, Booking } from '@/context/ConfigContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/date-helpers';
import { ClinicalHistoryModal } from '../staff/ClinicalHistoryModal';

export function BookingList() {
    const { bookings, deleteBooking, updateBookingStatus, team } = useConfig();
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [selectedSummaryDate, setSelectedSummaryDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewingHistory, setViewingHistory] = useState<Booking | null>(null);

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

    const filteredBookings = bookings.filter(b => {
        if (filterStatus === 'all') return true;
        return b.status === filterStatus;
    });

    const handlePrint = () => {
        const printContent = document.getElementById('daily-summary-content');
        if (!printContent) return;

        const originalContent = document.body.innerHTML;
        const summaryHtml = printContent.innerHTML;

        document.body.innerHTML = `
            <div style="padding: 40px; font-family: sans-serif; color: #1c1917;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-family: serif; margin: 0;">Arqueo de Caja - ${formatDate(new Date(selectedSummaryDate + 'T12:00:00'))}</h1>
                    <p style="color: #78716c; margin: 5px 0;">Resumen detallado de ingresos</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e7e5e4; margin-bottom: 30px;">
                ${summaryHtml}
                <div style="margin-top: 50px; border-top: 1px solid #e7e5e4; padding-top: 20px; font-size: 11px; color: #a8a29e; text-align: center; letter-spacing: 1px; text-transform: uppercase;">
                    La Rosée Beauté - Sistema de Gestión
                </div>
            </div>
            <style>
                .print-section { margin-bottom: 25px; border: 1px solid #e7e5e4; padding: 20px; border-radius: 12px; }
                .print-title { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #78716c; margin-bottom: 15px; border-bottom: 1px solid #f5f5f4; padding-bottom: 8px; }
                .print-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #f5f5f4; font-size: 13px; }
                .print-total { font-size: 20px; font-weight: bold; margin-top: 10px; text-align: right; }
            </style>
        `;

        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    const targetDateBookings = bookings.filter(b => b.date.startsWith(selectedSummaryDate) && (b.status === 'confirmed' || b.status === 'attended'));

    // Debug logging
    console.log('📊 Arqueo de Caja - Debug Info:');
    console.log('Fecha seleccionada:', selectedSummaryDate);
    console.log('Total de reservas:', bookings.length);
    console.log('Reservas del día (confirmed/attended):', targetDateBookings.length);
    console.log('Detalles:', targetDateBookings.map(b => ({
        cliente: b.clientName,
        precio: b.price,
        metodo: b.paymentMethod,
        estado: b.status,
        fecha: b.date
    })));

    const cashTotal = targetDateBookings
        .filter(b => b.paymentMethod === 'cash')
        .reduce((sum, b) => sum + (b.price || 0), 0);

    const cardTotal = targetDateBookings
        .filter(b => b.paymentMethod === 'card')
        .reduce((sum, b) => sum + (b.price || 0), 0);

    const cashBookings = targetDateBookings.filter(b => b.paymentMethod === 'cash');
    const cardBookings = targetDateBookings.filter(b => b.paymentMethod === 'card');

    return (
        <div className="space-y-6 relative">
            <div className="absolute -top-10 right-0">
                <button
                    onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                    className="text-[#3b82f6] hover:underline text-[10px] font-bold uppercase flex items-center gap-1"
                >
                    <span className="text-[8px]">{isSummaryOpen ? '▼' : '▶'}</span> Realizar Arqueo de Caja
                </button>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-serif font-bold text-stone-800">
                        Agenda de Turnos
                    </h2>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-stone-50 border border-stone-200 text-stone-600 text-sm rounded-xl px-4 py-2 outline-none focus:border-gold-300"
                    >
                        <option value="all">Todos</option>
                        <option value="pending">Pendientes</option>
                        <option value="confirmed">Confirmados</option>
                        <option value="attended">Atendidos</option>
                        <option value="absent">Ausentes</option>
                    </select>
                </div>

                {isSummaryOpen && (
                    <div className="mb-8 p-6 bg-stone-50 rounded-2xl border border-stone-100 animate-in slide-in-from-top-2">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
                            <h3 className="font-bold text-stone-800">Cierre de Caja Diario</h3>
                            <div className="flex items-center gap-2">
                                <label htmlFor="summaryDate" className="text-xs text-stone-500 font-bold">FECHA:</label>
                                <input
                                    type="date"
                                    id="summaryDate"
                                    value={selectedSummaryDate}
                                    onChange={(e) => setSelectedSummaryDate(e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm outline-none focus:border-gold-300"
                                />
                            </div>
                        </div>

                        <div id="daily-summary-content">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="print-section">
                                    <h4 className="text-xs font-bold text-stone-400 uppercase mb-4 print-title">Efectivo</h4>
                                    <div className="space-y-2 mb-4">
                                        {cashBookings.map(b => (
                                            <div key={b.id} className="flex justify-between text-sm py-1 border-b border-stone-100 print-item">
                                                <span className="text-stone-600">{b.clientName}</span>
                                                <span className="font-bold">€{b.price?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-right print-total">
                                        <p className="text-xs text-stone-400 font-bold">TOTAL EFECTIVO</p>
                                        <p className="text-2xl font-bold text-emerald-600">€{cashTotal.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="print-section">
                                    <h4 className="text-xs font-bold text-stone-400 uppercase mb-4 print-title">Tarjeta</h4>
                                    <div className="space-y-2 mb-4">
                                        {cardBookings.map(b => (
                                            <div key={b.id} className="flex justify-between text-sm py-1 border-b border-stone-100 print-item">
                                                <span className="text-stone-600">{b.clientName}</span>
                                                <span className="font-bold">€{b.price?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-right print-total">
                                        <p className="text-xs text-stone-400 font-bold">TOTAL TARJETA</p>
                                        <p className="text-2xl font-bold text-blue-600">€{cardTotal.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center border-t border-stone-100 pt-6 print:hidden">
                            <Button variant="outline" onClick={handlePrint}>
                                🖨️ Descargar Reporte PDF
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-16 text-stone-400 italic bg-white rounded-xl border-2 border-dashed border-stone-100">
                            No hay turnos con este filtro.
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white border border-stone-100 hover:border-gold-200 p-5 rounded-2xl transition-all group active:scale-[0.98]"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-stone-700 text-lg">{booking.clientName}</h3>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusColors[booking.status as keyof typeof statusColors || 'pending']}`}>
                                                {(booking.status || 'pending').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-stone-400 text-sm font-medium mb-3">{booking.serviceName} • {getProfessionalName(booking.professionalId)}</p>

                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="text-stone-400 font-bold">💵 €{booking.price?.toLocaleString()} • {booking.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="text-right hidden md:block mr-4">
                                            <p className="text-xs text-stone-400 font-bold uppercase">{formatDate(booking.date)}</p>
                                            <p className="text-2xl font-serif font-bold text-stone-800">{booking.time}</p>
                                        </div>

                                        <select
                                            value={booking.status || 'pending'}
                                            onChange={(e) => updateBookingStatus(booking.id, e.target.value as any)}
                                            className="text-xs font-bold border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-gold-300 cursor-pointer"
                                        >
                                            <option value="pending">PENDIENTE</option>
                                            <option value="confirmed">CONFIRMAR</option>
                                            <option value="attended">ATENDIDO</option>
                                            <option value="absent">AUSENTE</option>
                                        </select>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setViewingHistory(booking)}
                                                className="p-2 text-stone-300 hover:text-gold-600 transition-colors"
                                                title="Ver Ficha Clínica"
                                            >
                                                📋
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('¿Eliminar este turno?')) deleteBooking(booking.id);
                                                }}
                                                className="p-2 text-stone-200 hover:text-red-500 transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:hidden mt-4 pt-4 border-t border-stone-50 flex justify-between items-center bg-stone-50 rounded-lg px-4 py-2">
                                    <span className="text-xs text-stone-400 font-bold">{formatDate(booking.date)}</span>
                                    <span className="text-lg font-serif font-bold text-stone-800">{booking.time}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {viewingHistory && (
                <ClinicalHistoryModal
                    booking={viewingHistory}
                    onClose={() => setViewingHistory(null)}
                    professionalName={getProfessionalName(viewingHistory.professionalId)}
                />
            )}
        </div>
    );
}
