"use client";

import React, { useState } from 'react';
import { useConfig, TeamMember } from '@/context/ConfigContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ImageUpload } from '@/components/ui/ImageUpload';

export function TeamManager() {
    const { team, updateTeam } = useConfig();
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState('');
    const [pin, setPin] = useState('0000');

    const resetForm = () => {
        setId('');
        setName('');
        setRole('');
        setBio('');
        setImage('');
        setPin('0000');
        setIsEditing(false);
    };

    const handleEdit = (member: TeamMember) => {
        setId(member.id);
        setName(member.name);
        setRole(member.role);
        setBio(member.bio);
        setImage(member.image);
        setPin(member.pin || '0000');
        setIsEditing(true);
    };

    const handleDelete = (memberId: string) => {
        if (confirm('¿Eliminar a este miembro?')) {
            updateTeam(team.filter(t => t.id !== memberId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newMember: TeamMember = {
            id: id || Date.now().toString(),
            name,
            role,
            bio,
            image,
            pin
        };

        if (id) {
            // Edit
            updateTeam(team.map(t => t.id === id ? newMember : t));
        } else {
            // Create
            updateTeam([...team, newMember]);
        }
        resetForm();
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-serif font-bold text-stone-800">
                        Equipo
                    </h2>
                    <Button
                        variant="goldOutline"
                        onClick={() => { resetForm(); setIsEditing(!isEditing); }}
                    >
                        {isEditing ? 'CERRAR' : '+ NUEVO PROFESIONAL'}
                    </Button>
                </div>

                {isEditing && (
                    <form onSubmit={handleSubmit} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 animate-in slide-in-from-top-2 space-y-6">
                        <div className="flex gap-6 items-center">
                            <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden border border-stone-200">
                                {image ? (
                                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">👤</span>
                                )}
                            </div>
                            <ImageUpload onUpload={setImage} label={image ? "Cambiar Foto" : "Subir Foto"} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Nombre Completo</label>
                                <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300" placeholder="Ej: Dra. Ana García" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Especialidad</label>
                                <input required value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300" placeholder="Ej: Especialista Facial" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Biografía</label>
                            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300" placeholder="Breve descripción profesional..." />
                        </div>

                        <div className="w-full md:w-32">
                            <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">PIN Acceso</label>
                            <input
                                required
                                type="text"
                                maxLength={4}
                                pattern="\d{4}"
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 font-mono text-center text-lg tracking-widest outline-none focus:border-gold-300"
                                placeholder="0000"
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-stone-100">
                            <Button type="submit">Guardar Especialista</Button>
                        </div>
                    </form>
                )}

                <div className="grid gap-3">
                    {team.map(member => (
                        <div key={member.id} className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex items-center gap-4 group hover:bg-stone-100 transition-all">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-stone-200 shrink-0">
                                {member.image ? <img src={member.image} alt={member.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-200 flex items-center justify-center text-xl">👤</div>}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-stone-700">{member.name}</h3>
                                <p className="text-gold-600 text-xs font-bold">{member.role}</p>
                                <p className="text-[10px] text-stone-400 font-mono">ID: {member.pin || '0000'}</p>
                            </div>
                            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(member)}
                                    className="text-xs font-bold text-stone-400 hover:text-stone-800"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id)}
                                    className="text-xs font-bold text-stone-300 hover:text-red-500"
                                >
                                    Borrar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
