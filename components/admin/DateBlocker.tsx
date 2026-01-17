import { useState } from 'react';
import { useConfig, TeamMember } from '@/context/ConfigContext';
import { getDaysInMonth, getFirstDayOfMonth, formatDate } from '@/utils/date-helpers';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function DateBlocker() {
    const { blockedDates, toggleBlockedDate, team, professionalBlocks, addProfessionalBlock, removeProfessionalBlock } = useConfig();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedProId, setSelectedProId] = useState<string>('global'); // 'global' or pro ID

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];

        if (selectedProId === 'global') {
            toggleBlockedDate(dateStr);
        } else {
            // Check if already blocked for this pro
            const existingBlock = professionalBlocks.find(b => b.date === dateStr && b.professionalId === selectedProId);
            if (existingBlock) {
                removeProfessionalBlock(existingBlock.id);
            } else {
                addProfessionalBlock({
                    id: crypto.randomUUID(),
                    date: dateStr,
                    professionalId: selectedProId
                });
            }
        }
    };

    const isBlocked = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];

        if (selectedProId === 'global') {
            return blockedDates.includes(dateStr);
        } else {
            return professionalBlocks.some(b => b.date === dateStr && b.professionalId === selectedProId);
        }
    };

    const hasAnyBlock = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];

        const globalBlock = blockedDates.includes(dateStr);
        const proBlock = professionalBlocks.some(b => b.date === dateStr);
        return { global: globalBlock, pro: proBlock };
    };

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <h2 className="text-2xl font-serif font-bold text-stone-800">
                    Bloquear Fechas
                </h2>
                {team.length > 0 && (
                    <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100 w-full md:w-auto">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-tighter">Afecta a:</span>
                        <select
                            value={selectedProId}
                            onChange={(e) => setSelectedProId(e.target.value)}
                            className="text-sm font-bold bg-transparent border-none text-stone-700 outline-none focus:ring-0 cursor-pointer flex-1"
                        >
                            <option value="global">Cierre General</option>
                            {team.map(member => (
                                <option key={member.id} value={member.id}>{member.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-100">
                    <button onClick={prevMonth} className="p-2 text-stone-300 hover:text-stone-800 transition-colors">
                        ←
                    </button>
                    <div className="text-lg font-serif font-bold text-stone-800 uppercase">
                        {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={nextMonth} className="p-2 text-stone-300 hover:text-stone-800 transition-colors">
                        →
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-4 mb-4 text-center">
                    {['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'].map((day, idx) => (
                        <div key={idx} className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-4">
                    {[...Array(firstDay)].map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isWknd = date.getDay() === 0 || date.getDay() === 6;
                        const blocked = isBlocked(day);
                        const blocks = hasAnyBlock(day);

                        return (
                            <button
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`
                                    aspect-square flex flex-col items-center justify-center text-sm transition-all relative
                                    ${isWknd ? 'text-stone-300' : 'text-stone-600 hover:bg-stone-50 rounded-lg'}
                                `}
                            >
                                <span className={`${blocked ? 'font-bold' : ''}`}>{day}</span>
                                <div className="flex gap-1 mt-1">
                                    {blocked && (
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                    )}
                                    {!blocked && selectedProId === 'global' && blocks.pro && (
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest justify-center">
                    <div className="flex items-center gap-2 text-stone-400">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Bloqueado (Selección)</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Bloqueo Parcial</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
