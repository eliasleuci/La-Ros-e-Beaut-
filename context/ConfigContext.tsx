"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service } from '@/components/booking/ServiceSelection';
import { supabase } from '@/lib/supabase';

export interface FAQ {
    id: string;
    question: string; // ES
    answer: string;   // ES
    question_en?: string;
    answer_en?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string;
    image: string; // Base64
    pin?: string; // New: individual pin
}

export interface Booking {
    id: string;
    clientName: string;
    clientPhone: string;
    serviceId: string;
    serviceName: string;
    price: number;
    paymentMethod: 'cash' | 'card';
    date: string; // ISO
    time: string;
    createdAt: string;
    status: 'pending' | 'confirmed' | 'attended' | 'absent';
    professionalId?: string;
}

export interface ClinicalRecord {
    id: string;
    clientName: string;
    clientPhone: string;
    professionalId: string;
    professionalName: string;
    date: string;
    treatment: string;
    notes: string;
}

export interface Review {
    id: string;
    clientName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    approved: boolean; // For moderation
}

export interface ProfessionalBlock {
    id: string;
    date: string; // YYYY-MM-DD
    professionalId: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    color: string;
}

export interface Expense {
    id: string;
    categoryId: string;
    categoryName: string;
    amount: number;
    description: string;
    date: string; // YYYY-MM-DD
    paymentMethod: 'cash' | 'card' | 'transfer';
    createdAt: string;
}

interface ConfigContextType {
    services: Service[];
    businessPhone: string;
    adminPin: string;
    blockedDates: string[];
    professionalBlocks: ProfessionalBlock[];
    faqs: FAQ[];
    galleryImages: string[];
    team: TeamMember[];
    bookings: Booking[];
    reviews: Review[];
    clinicalRecords: ClinicalRecord[];
    expenseCategories: ExpenseCategory[];
    expenses: Expense[];
    updateServices: (services: Service[]) => void;
    updatePhone: (phone: string) => void;
    updatePin: (pin: string) => void;
    toggleBlockedDate: (date: string) => void;
    updateBlockedDates: (dates: string[]) => void;
    addProfessionalBlock: (block: ProfessionalBlock) => void;
    removeProfessionalBlock: (id: string) => void;
    updateFaqs: (faqs: FAQ[]) => void;
    updateGallery: (images: string[]) => void;
    updateTeam: (team: TeamMember[]) => void;
    addBooking: (booking: Booking) => void;
    updateBookingStatus: (id: string, status: Booking['status']) => void;
    deleteBooking: (id: string) => void;
    addReview: (review: Review) => void;
    deleteReview: (id: string) => void;
    addClinicalRecord: (record: ClinicalRecord) => void;
    updateClinicalRecord: (record: ClinicalRecord) => void;
    deleteClinicalRecord: (id: string) => void;
    addExpenseCategory: (category: ExpenseCategory) => void;
    updateExpenseCategory: (category: ExpenseCategory) => void;
    deleteExpenseCategory: (id: string) => void;
    addExpense: (expense: Expense) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (id: string) => void;
    importHolidays: () => void;
    resetToDefaults: () => void;
}

const DEFAULT_SERVICES: Service[] = [
    {
        id: 's1',
        name: 'Limpieza de Cutis Profunda',
        name_en: 'Deep Facial Cleansing',
        price: 45,
        duration: '60 min',
        category: 'Tratamiento Facial',
        description: 'Tratamiento completo de exfoliación, extracción e hidratación.',
        description_en: 'Full treatment involving exfoliation, extraction, and hydration.'
    },
    {
        id: 's2',
        name: 'Lifting de Pestañas',
        name_en: 'Lash Lifting',
        price: 30,
        duration: '45 min',
        category: 'Lifting y Cejas',
        description: 'Diseño y curvado natural de pestañas.',
        description_en: 'Natural design and curling of eyelashes.'
    }
];

const DEFAULT_PHONE = '34617586856';
const DEFAULT_PIN = '1234';
const DEFAULT_BLOCKED_DATES: string[] = [];
const DEFAULT_PROFESSIONAL_BLOCKS: ProfessionalBlock[] = [];
const DEFAULT_FAQS: FAQ[] = [
    {
        id: '1',
        question: '¿Con cuánto tiempo debo cancelar?',
        answer: 'Requerimos al menos 24hs de aviso para cancelaciones sin cargo.',
        question_en: 'How far in advance should I cancel?',
        answer_en: 'We require at least 24 hours notice for cancellations free of charge.'
    },
    {
        id: '2',
        question: '¿Qué medios de pago aceptan?',
        answer: 'Efectivo y Tarjeta.',
        question_en: 'What payment methods do you accept?',
        answer_en: 'Cash and Card.'
    },
];
const DEFAULT_GALLERY: string[] = [];
const DEFAULT_TEAM: TeamMember[] = [];
const DEFAULT_BOOKINGS: Booking[] = [];
const DEFAULT_REVIEWS: Review[] = [];

const MARBELLA_HOLIDAYS_2026 = [
    '2026-01-01', // Año Nuevo
    '2026-01-06', // Epifanía
    '2026-02-28', // Día de Andalucía
    '2026-04-02', // Jueves Santo
    '2026-04-03', // Viernes Santo
    '2026-05-01', // Fiesta del Trabajo
    '2026-06-11', // San Bernabé (Local)
    '2026-08-15', // Asunción
    '2026-10-12', // Fiesta Nacional
    '2026-10-19', // San Pedro de Alcántara (Local)
    '2026-11-02', // Todos los Santos (trasladado)
    '2026-12-08', // Inmaculada
    '2026-12-25', // Navidad
];

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [services, setServices] = useState<Service[]>([]);
    const [businessPhone, setBusinessPhone] = useState(DEFAULT_PHONE);
    const [adminPin, setAdminPin] = useState(DEFAULT_PIN);
    const [blockedDates, setBlockedDates] = useState<string[]>(DEFAULT_BLOCKED_DATES);
    const [professionalBlocks, setProfessionalBlocks] = useState<ProfessionalBlock[]>(DEFAULT_PROFESSIONAL_BLOCKS);
    const [faqs, setFaqs] = useState<FAQ[]>(DEFAULT_FAQS);
    const [galleryImages, setGalleryImages] = useState<string[]>(DEFAULT_GALLERY);
    const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM);
    const [bookings, setBookings] = useState<Booking[]>(DEFAULT_BOOKINGS);
    const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
    const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from Supabase on mount with migration and self-healing logic
    useEffect(() => {
        async function loadData() {
            try {
                console.log('Iniciando sincronización con la nube...');

                // Fetch all data in parallel
                const [
                    { data: servicesData },
                    { data: configData },
                    { data: faqsData },
                    { data: teamData },
                    { data: bookingsData },
                    { data: reviewsData },
                    { data: clinicalData },
                    { data: galleryData },
                    { data: proBlockedData },
                    { data: expenseCategoriesData },
                    { data: expensesData }
                ] = await Promise.all([
                    supabase.from('services').select('*'),
                    supabase.from('app_config').select('*'),
                    supabase.from('faqs').select('*'),
                    supabase.from('team').select('*'),
                    supabase.from('bookings').select('*').order('created_at', { ascending: false }),
                    supabase.from('reviews').select('*').order('date', { ascending: false }),
                    supabase.from('clinical_records').select('*').order('date', { ascending: false }),
                    supabase.from('gallery').select('*'),
                    supabase.from('professional_blocks').select('*'),
                    supabase.from('expense_categories').select('*'),
                    supabase.from('expenses').select('*').order('created_at', { ascending: false })
                ]);

                // Check if Cloud is empty
                // We consider cloud NOT empty if there are services OR if there is config data (meaning it was already initialized)
                const cloudIsReady = (servicesData && servicesData.length > 0) || (configData && configData.length > 0) || (faqsData && faqsData.length > 0);

                if (!cloudIsReady) {
                    console.log('Cloud está vacío o incompleto. Buscando datos locales para migrar...');

                    const savedServices = localStorage.getItem('estetica_services');
                    const savedBookings = localStorage.getItem('estetica_bookings');
                    const savedFaqs = localStorage.getItem('estetica_faqs');
                    const savedTeam = localStorage.getItem('estetica_team');
                    const savedPhone = localStorage.getItem('estetica_phone');

                    // SELF-HEALING: If EVERYTHING is empty or INVALID (no categories), use defaults
                    let servicesToUse = savedServices ? JSON.parse(savedServices) : DEFAULT_SERVICES;

                    // Validate if services have categories (Legacy check)
                    const hasValidCategories = servicesToUse.every((s: Service) => s.category && s.category !== 'Otros');
                    if (!hasValidCategories) {
                        console.log('Datos locales antiguos detectados. Usando nuevos defaults...');
                        servicesToUse = DEFAULT_SERVICES;
                    }

                    const faqsToUse = savedFaqs ? JSON.parse(savedFaqs) : DEFAULT_FAQS;
                    const phoneToUse = (savedPhone || DEFAULT_PHONE).replace(/\D/g, '');
                    const teamToUse = savedTeam ? JSON.parse(savedTeam) : [];

                    setServices(servicesToUse);
                    setFaqs(faqsToUse);
                    setBusinessPhone(phoneToUse);
                    setTeam(teamToUse);

                    // Upload to Cloud so it stays there
                    console.log('Subiendo datos iniciales a la nube...');
                    await supabase.from('services').delete().not('id', 'is', null); // Clear old garbage if any
                    if (servicesToUse.length > 0) await supabase.from('services').insert(servicesToUse);
                    if (faqsToUse.length > 0) await supabase.from('faqs').insert(faqsToUse);
                    await supabase.from('app_config').upsert({ key: 'business_phone', value: phoneToUse });
                    if (teamToUse.length > 0) await supabase.from('team').insert(teamToUse);

                    // Migrate Bookings and Clinical if they exist
                    if (savedBookings) {
                        const parsedBookings = JSON.parse(savedBookings);
                        setBookings(parsedBookings);
                        for (const b of parsedBookings) {
                            await supabase.from('bookings').insert({
                                id: b.id, client_name: b.clientName, client_phone: b.clientPhone,
                                service_id: b.serviceId, service_name: b.serviceName, price: b.price,
                                payment_method: b.paymentMethod, date: b.date, time: b.time,
                                status: b.status, professional_id: b.professionalId, created_at: b.createdAt
                            });
                        }
                    }

                    const savedClinical = localStorage.getItem('estetica_clinical');
                    if (savedClinical) {
                        const parsedC = JSON.parse(savedClinical);
                        setClinicalRecords(parsedC);
                        for (const c of parsedC) {
                            await supabase.from('clinical_records').insert({
                                id: c.id, client_name: c.clientName, client_phone: c.clientPhone,
                                professional_id: c.professional_id, professional_name: c.professional_name,
                                date: c.date, treatment: c.treatment, notes: c.notes
                            });
                        }
                    }
                } else {
                    // Cloud has data
                    console.log('Datos cargados desde la nube. Verificando integridad...');

                    // TRUST CLOUD DATA
                    setServices(servicesData || []);
                    if (faqsData) setFaqs(faqsData);
                    if (teamData) setTeam(teamData);

                    console.log('📥 Cargando reservas desde Supabase...');
                    console.log('Datos crudos de bookings:', bookingsData);
                    console.log('Cantidad de bookings:', bookingsData?.length || 0);

                    if (bookingsData) {
                        const mappedBookings = bookingsData.map((b: any) => ({
                            ...b,
                            clientName: b.client_name,
                            clientPhone: b.client_phone,
                            serviceId: b.service_id,
                            serviceName: b.service_name,
                            paymentMethod: b.payment_method,
                            professionalId: b.professional_id,
                            createdAt: b.created_at
                        }));
                        console.log('Bookings mapeados:', mappedBookings);
                        setBookings(mappedBookings);
                    }
                    if (reviewsData) setReviews(reviewsData.map((r: any) => ({ ...r, clientName: r.client_name })));
                    if (clinicalData) {
                        setClinicalRecords(clinicalData.map((c: any) => ({
                            ...c,
                            clientName: c.client_name,
                            clientPhone: c.client_phone,
                            professionalId: c.professional_id,
                            professionalName: c.professional_name
                        })));
                    }

                    if (configData) {
                        const adminPinVal = configData.find((c: any) => c.key === 'admin_pin')?.value;
                        const phoneVal = configData.find((c: any) => c.key === 'business_phone')?.value;
                        const blockedDatesVal = configData.find((c: any) => c.key === 'blocked_dates')?.value;
                        if (adminPinVal) setAdminPin(adminPinVal);
                        if (phoneVal) setBusinessPhone(phoneVal.replace(/\D/g, ''));
                        if (blockedDatesVal) setBlockedDates(JSON.parse(blockedDatesVal));
                    }

                    if (proBlockedData) setProfessionalBlocks(proBlockedData);
                    if (galleryData) setGalleryImages(galleryData.map((g: any) => g.image_url));

                    // Load expense categories and expenses
                    if (expenseCategoriesData) setExpenseCategories(expenseCategoriesData);
                    if (expensesData) {
                        setExpenses(expensesData.map((e: any) => ({
                            ...e,
                            categoryId: e.category_id,
                            categoryName: e.category_name,
                            paymentMethod: e.payment_method,
                            createdAt: e.created_at
                        })));
                    }
                }

            } catch (error) {
                console.error('Error crítico en sincronización:', error);
                // Last ditch effort: show local data if everything fails
                const saved = localStorage.getItem('estetica_services');
                if (saved) setServices(JSON.parse(saved));
            } finally {
                setIsLoaded(true);
            }
        }
        loadData();
    }, []);



    const updateServices = async (newServices: Service[]) => {
        setServices(newServices);

        console.log('🔄 Sincronizando servicios con una estrategia diferencial...');

        try {
            // 1. Obtener IDs actuales en la BD para saber cuáles borrar
            const { data: currentDbServices, error: fetchError } = await supabase.from('services').select('id');

            if (fetchError) {
                console.error('❌ Error al obtener servicios actuales:', fetchError);
                return;
            }

            const currentIds = currentDbServices?.map((s: { id: string }) => s.id) || [];
            const newIds = newServices.map(s => s.id);

            // 2. Identificar IDs que ya no existen (para borrar)
            const idsToDelete = currentIds.filter((id: string) => !newIds.includes(id));

            console.log('📊 DIAGNÓSTICO DE SINCRONIZACIÓN:');
            console.log('   - IDs en Base de Datos:', currentIds);
            console.log('   - IDs en Nuevo Estado:', newIds);
            console.log('   - IDs Detectados para Borrar:', idsToDelete);

            // 3. Borrar solo los servicios removidos
            if (idsToDelete.length > 0) {
                console.log('🗑️ Intentando eliminar servicios:', idsToDelete);
                const { error: deleteError, count } = await supabase
                    .from('services')
                    .delete({ count: 'exact' }) // Request count of deleted rows
                    .in('id', idsToDelete);

                if (deleteError) {
                    console.error('❌ Error al eliminar servicios:', deleteError);
                    alert('⚠️ No se pudieron eliminar algunos servicios. Error: ' + deleteError.message);
                } else {
                    console.log(`✅ Servicios eliminados correctamente. Registros afectados: ${count}`);
                }
            }

            // 4. Actualizar o Insertar los servicios actuales (Upsert)
            if (newServices.length > 0) {
                console.log('💾 Intentando guardar en Supabase:', newServices);
                const { error: upsertError, data: upsertData } = await supabase
                    .from('services')
                    .upsert(newServices, { onConflict: 'id' })
                    .select(); // Request back the data to verify what was saved

                if (upsertError) {
                    console.error('❌ Error al guardar servicios:', upsertError);
                    alert('Error al guardar cambios: ' + upsertError.message);
                } else {
                    console.log('✅ Servicios actualizados correctamente en DB:', upsertData);
                }
            }

            // 5. RE-FETCH FINAL (Para asegurar que lo que ve el usuario es lo real)
            const { data: finalData } = await supabase.from('services').select('*');
            if (finalData) {
                console.log('🔄 Sincronización final: actualizando estado local desde DB');
                setServices(finalData);
            }

        } catch (err) {
            console.error('❌ Error inesperado en updateServices:', err);
            alert('Ocurrió un error inesperado al guardar los servicios.');
        }
    };

    const updatePhone = async (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        setBusinessPhone(cleanPhone);
        localStorage.setItem('estetica_phone', cleanPhone);

        const { error } = await supabase
            .from('app_config')
            .upsert({ key: 'business_phone', value: cleanPhone }, { onConflict: 'key' });

        if (error) {
            console.error('Error al actualizar teléfono:', error);
        } else {
            console.log('Teléfono actualizado exitosamente:', cleanPhone);
        }
    };

    const updatePin = async (pin: string) => {
        setAdminPin(pin);
        await supabase.from('app_config').upsert({ key: 'admin_pin', value: pin }, { onConflict: 'key' });
    };

    const toggleBlockedDate = async (date: string) => {
        const newBlocked = blockedDates.includes(date)
            ? blockedDates.filter(d => d !== date)
            : [...blockedDates, date];
        setBlockedDates(newBlocked);
        await supabase.from('app_config').upsert({ key: 'blocked_dates', value: JSON.stringify(newBlocked) }, { onConflict: 'key' });
    };

    const updateBlockedDates = async (newBlocked: string[]) => {
        setBlockedDates(newBlocked);
        await supabase.from('app_config').upsert({ key: 'blocked_dates', value: JSON.stringify(newBlocked) }, { onConflict: 'key' });
    };

    const addProfessionalBlock = async (block: ProfessionalBlock) => {
        setProfessionalBlocks(prev => [...prev, block]);
        await supabase.from('professional_blocks').insert(block);
    };

    const removeProfessionalBlock = async (id: string) => {
        setProfessionalBlocks(prev => prev.filter(b => b.id !== id));
        await supabase.from('professional_blocks').delete().eq('id', id);
    };

    const updateFaqs = async (newFaqs: FAQ[]) => {
        setFaqs(newFaqs);
        await supabase.from('faqs').delete().not('id', 'is', null);
        await supabase.from('faqs').insert(newFaqs);
    };

    const updateGallery = async (images: string[]) => {
        setGalleryImages(images);
        const { error: delError } = await supabase.from('gallery').delete().not('id', 'is', null);
        if (delError) console.error('Error al limpiar galería:', delError);

        const { error: insError } = await supabase.from('gallery').insert(images.map(url => ({ image_url: url })));
        if (insError) console.error('Error al insertar en galería:', insError);
        else console.log('Galería sincronizada exitosamente');
    };

    const updateTeam = async (newTeam: TeamMember[]) => {
        setTeam(newTeam);
        await supabase.from('team').delete().not('id', 'is', null);
        await supabase.from('team').insert(newTeam);
    };

    const addBooking = async (booking: Booking) => {
        setBookings(prev => [booking, ...prev]);

        const { data, error } = await supabase.from('bookings').insert({
            id: booking.id,
            client_name: booking.clientName,
            client_phone: booking.clientPhone,
            service_id: booking.serviceId,
            service_name: booking.serviceName,
            price: booking.price,
            payment_method: booking.paymentMethod,
            date: booking.date,
            time: booking.time,
            status: booking.status,
            professional_id: booking.professionalId
        });

        if (error) {
            console.error('❌ Error al guardar reserva en Supabase:', error);
            console.log('Datos que se intentaron guardar:', booking);
        } else {
            console.log('✅ Reserva guardada exitosamente en Supabase:', data);
        }
    };

    const updateBookingStatus = async (id: string, status: Booking['status']) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        await supabase.from('bookings').update({ status }).eq('id', id);
    };

    const deleteBooking = async (id: string) => {
        setBookings(prev => prev.filter(b => b.id !== id));
        await supabase.from('bookings').delete().eq('id', id);
    };

    const addReview = async (review: Review) => {
        setReviews(prev => [review, ...prev]);
        await supabase.from('reviews').insert({
            id: review.id,
            client_name: review.clientName,
            rating: review.rating,
            comment: review.comment,
            date: review.date,
            approved: review.approved
        });
    };

    const deleteReview = async (id: string) => {
        setReviews(prev => prev.filter(r => r.id !== id));
        await supabase.from('reviews').delete().eq('id', id);
    };

    const addClinicalRecord = async (record: ClinicalRecord) => {
        setClinicalRecords(prev => [record, ...prev]);
        await supabase.from('clinical_records').insert({
            id: record.id,
            client_name: record.clientName,
            client_phone: record.clientPhone,
            professional_id: record.professionalId,
            professional_name: record.professionalName,
            date: record.date,
            treatment: record.treatment,
            notes: record.notes
        });
    };

    const updateClinicalRecord = async (record: ClinicalRecord) => {
        setClinicalRecords(prev => prev.map(r => r.id === record.id ? record : r));
        await supabase.from('clinical_records').update({
            notes: record.notes,
            treatment: record.treatment,
            date: record.date
        }).eq('id', record.id);
    };

    const deleteClinicalRecord = async (id: string) => {
        setClinicalRecords(prev => prev.filter(r => r.id !== id));
        await supabase.from('clinical_records').delete().eq('id', id);
    };

    // Expense Category CRUD
    const addExpenseCategory = async (category: ExpenseCategory) => {
        setExpenseCategories(prev => [...prev, category]);
        await supabase.from('expense_categories').insert(category);
    };

    const updateExpenseCategory = async (category: ExpenseCategory) => {
        setExpenseCategories(prev => prev.map(c => c.id === category.id ? category : c));
        await supabase.from('expense_categories').update({
            name: category.name,
            color: category.color
        }).eq('id', category.id);
    };

    const deleteExpenseCategory = async (id: string) => {
        setExpenseCategories(prev => prev.filter(c => c.id !== id));
        await supabase.from('expense_categories').delete().eq('id', id);
        // Also delete all expenses in this category
        setExpenses(prev => prev.filter(e => e.categoryId !== id));
        await supabase.from('expenses').delete().eq('category_id', id);
    };

    // Expense CRUD
    const addExpense = async (expense: Expense) => {
        setExpenses(prev => [expense, ...prev]);
        await supabase.from('expenses').insert({
            id: expense.id,
            category_id: expense.categoryId,
            category_name: expense.categoryName,
            amount: expense.amount,
            description: expense.description,
            date: expense.date,
            payment_method: expense.paymentMethod,
            created_at: expense.createdAt
        });
    };

    const updateExpense = async (expense: Expense) => {
        setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
        await supabase.from('expenses').update({
            category_id: expense.categoryId,
            category_name: expense.categoryName,
            amount: expense.amount,
            description: expense.description,
            date: expense.date,
            payment_method: expense.paymentMethod
        }).eq('id', expense.id);
    };

    const deleteExpense = async (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
        await supabase.from('expenses').delete().eq('id', id);
    };

    const importHolidays = async () => {
        const newDates = Array.from(new Set([...blockedDates, ...MARBELLA_HOLIDAYS_2026]));
        setBlockedDates(newDates);
        await supabase.from('app_config').upsert({ key: 'blocked_dates', value: JSON.stringify(newDates) }, { onConflict: 'key' });
        alert(`Se han importado ${MARBELLA_HOLIDAYS_2026.length} feriados de Marbella 2026.`);
    };

    const resetToDefaults = () => {
        setServices(DEFAULT_SERVICES);
        setBusinessPhone(DEFAULT_PHONE);
        setAdminPin(DEFAULT_PIN);
        setBlockedDates(DEFAULT_BLOCKED_DATES);
        setFaqs(DEFAULT_FAQS);
        setGalleryImages(DEFAULT_GALLERY);
        setTeam(DEFAULT_TEAM);
        setBookings(DEFAULT_BOOKINGS);
        setReviews(DEFAULT_REVIEWS);
    };

    return (
        <ConfigContext.Provider value={{
            services,
            businessPhone,
            adminPin,
            blockedDates,
            professionalBlocks,
            faqs,
            galleryImages,
            team,
            bookings,
            reviews,
            clinicalRecords,
            expenseCategories,
            expenses,
            updateServices,
            updatePhone,
            updatePin,
            toggleBlockedDate,
            updateBlockedDates,
            addProfessionalBlock,
            removeProfessionalBlock,
            updateFaqs,
            updateGallery,
            updateTeam,
            addBooking,
            updateBookingStatus,
            deleteBooking,
            addReview,
            deleteReview,
            addClinicalRecord,
            updateClinicalRecord,
            deleteClinicalRecord,
            addExpenseCategory,
            updateExpenseCategory,
            deleteExpenseCategory,
            addExpense,
            updateExpense,
            deleteExpense,
            importHolidays,
            resetToDefaults
        }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}
