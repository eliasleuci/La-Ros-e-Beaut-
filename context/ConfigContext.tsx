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

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
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
                    { data: proBlockedData }
                ] = await Promise.all([
                    supabase.from('services').select('*'),
                    supabase.from('app_config').select('*'),
                    supabase.from('faqs').select('*'),
                    supabase.from('team').select('*'),
                    supabase.from('bookings').select('*').order('created_at', { ascending: false }),
                    supabase.from('reviews').select('*').order('date', { ascending: false }),
                    supabase.from('clinical_records').select('*').order('date', { ascending: false }),
                    supabase.from('gallery').select('*'),
                    supabase.from('professional_blocks').select('*')
                ]);

                // Check if Cloud is empty
                const cloudIsReady = servicesData && servicesData.length > 0;

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
                    if (bookingsData) {
                        setBookings(bookingsData.map((b: any) => ({
                            ...b,
                            clientName: b.client_name,
                            clientPhone: b.client_phone,
                            serviceId: b.service_id,
                            serviceName: b.service_name,
                            paymentMethod: b.payment_method,
                            professionalId: b.professional_id,
                            createdAt: b.created_at
                        })));
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
        const { error: delError } = await supabase.from('services').delete().not('id', 'is', null);
        if (delError) console.error('Error al limpiar servicios:', delError);

        const { error: insError } = await supabase.from('services').insert(newServices);
        if (insError) console.error('Error al insertar servicios:', insError);
        else console.log('Servicios sincronizados exitosamente');
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
        await supabase.from('bookings').insert({
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
