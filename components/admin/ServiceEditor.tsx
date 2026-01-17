import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Service } from '@/components/booking/ServiceSelection';

interface ServiceEditorProps {
    initialService?: Service | null;
    defaultCategory?: string;
    onSave: (service: Service) => void;
    onCancel: () => void;
}

export function ServiceEditor({ initialService, defaultCategory, onSave, onCancel }: ServiceEditorProps) {
    const [name, setName] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [category, setCategory] = useState(defaultCategory || '');
    const [description, setDescription] = useState('');
    const [descriptionEn, setDescriptionEn] = useState('');

    useEffect(() => {
        if (initialService) {
            setName(initialService.name);
            setNameEn(initialService.name_en || '');
            setPrice(initialService.price.toString());
            setDuration(initialService.duration);
            setCategory(initialService.category || 'Otros');
            setDescription(initialService.description || '');
            setDescriptionEn(initialService.description_en || '');
        } else if (defaultCategory) {
            setCategory(defaultCategory);
        }
    }, [initialService, defaultCategory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialService?.id || Date.now().toString(),
            name,
            name_en: nameEn,
            price: Number(price),
            duration,
            category: category || 'Otros',
            description,
            description_en: descriptionEn
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mt-4">
            <h3 className="font-bold text-lg mb-6 text-stone-800">{initialService ? '📝 Editar Servicio' : '✨ Nuevo Servicio'}</h3>

            <div className="space-y-6">
                <div>
                    <label className="flex items-center justify-between text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">
                        <span>Nombre del Servicio (ES / EN)</span>
                        <button
                            type="button"
                            onClick={() => setNameEn(name)}
                            className="text-[10px] text-gold-400 hover:text-gold-500 underline"
                        >
                            Copiar ES ➡ EN
                        </button>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            required
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                            placeholder="ES: Microblading"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <input
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                            placeholder="EN: Microblading"
                            value={nameEn}
                            onChange={e => setNameEn(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Categoría</label>
                    <div className="space-y-2">
                        <select
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 focus:border-gold-300 outline-none appearance-none cursor-pointer"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="">Seleccionar existente...</option>
                            <option value="Micropigmentación">Micropigmentación</option>
                            <option value="Lifting y Cejas">Lifting y Cejas</option>
                            <option value="Tratamiento Facial">Tratamiento Facial</option>
                            <option value="Tratamiento Corporal">Tratamiento Corporal</option>
                            <option value="Otros">Otros</option>
                        </select>
                        <input
                            list="categories"
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                            placeholder="O escribir nueva categoría..."
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        />
                        <datalist id="categories">
                            <option value="Micropigmentación" />
                            <option value="Lifting y Cejas" />
                            <option value="Tratamiento Facial" />
                            <option value="Tratamiento Corporal" />
                        </datalist>
                    </div>
                </div>

                <div>
                    <label className="flex items-center justify-between text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">
                        <span>Descripción (Opcional - ES / EN)</span>
                        <button
                            type="button"
                            onClick={() => setDescriptionEn(description)}
                            className="text-[10px] text-gold-400 hover:text-gold-500 underline"
                        >
                            Copiar ES ➡ EN
                        </button>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                            placeholder="ES: Incluye perfilado"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                        <input
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                            placeholder="EN: Includes shaping"
                            value={descriptionEn}
                            onChange={e => setDescriptionEn(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Precio (€)</label>
                        <input
                            required
                            type="number"
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Duración</label>
                        <input
                            required
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                            placeholder="Ej: 60 min"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">Guardar Cambios</Button>
                </div>
            </div>
        </form>
    );
}
