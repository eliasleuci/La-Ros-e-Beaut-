"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ServiceSelection, Service } from './ServiceSelection';
import { Calendar } from './Calendar';
import { ContactForm } from './ContactForm';
import { createWhatsAppLink } from '@/utils/whatsapp';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';

type Step = 'service' | 'date' | 'contact';

export function BookingWizard() {
    const { t, language } = useLanguage();
    const { businessPhone, addBooking, team, professionalBlocks } = useConfig();
    const [step, setStep] = useState<Step>('service');
    const [data, setData] = useState({
        service: null as Service | null,
        date: null as Date | null,
        time: null as string | null,
    });

    const handleServiceSelect = (service: Service) => {
        setData(prev => ({ ...prev, service }));
        setStep('date');
    };

    const handleDateSelect = (date: Date, time: string) => {
        setData(prev => ({ ...prev, date, time }));
        setStep('contact');
    };

    const handleContactSubmit = (name: string, phone: string, paymentMethod: 'cash' | 'card') => {
        if (data.service && data.date && data.time) {
            // CRITICAL: Double check if it's a weekend at submission time
            const { isWeekend } = require('@/utils/date-helpers');
            if (isWeekend(data.date)) {
                alert(t('common.weekend_alert'));
                setStep('date');
                return;
            }

            // Assign Random Professional Logic
            const { toSpainDateString } = require('@/utils/date-helpers');
            const dateStr = toSpainDateString(data.date);

            // Filter team members who are NOT blocked on this date
            const availableProfessionals = team.filter(pro => {
                const isBlocked = professionalBlocks.some(block =>
                    block.professionalId === pro.id && block.date === dateStr
                );
                return !isBlocked;
            });

            const pool = availableProfessionals.length > 0 ? availableProfessionals : [];
            const randomProfessional = pool.length > 0
                ? pool[Math.floor(Math.random() * pool.length)]
                : null;

            // 1. Save Booking Locally
            const finalDateString = `${dateStr}T${data.time}:00+01:00`;
            const newBooking: any = {
                id: crypto.randomUUID(),
                clientName: name,
                clientPhone: phone,
                serviceId: data.service.id,
                serviceName: data.service.name,
                date: finalDateString, // Store with Argentina timezone offset
                time: data.time,
                createdAt: new Date().toISOString(),
                status: 'pending',
                professionalId: randomProfessional?.id,
                price: data.service.price,
                paymentMethod: paymentMethod
            };
            addBooking(newBooking);

            // 2. Generate WhatsApp Link
            const link = createWhatsAppLink(businessPhone, {
                service: data.service.name,
                date: data.date,
                time: data.time,
                clientName: name,
            }, language);
            window.open(link, '_blank');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <Card key={step} className="">
                {step === 'service' && (
                    <ServiceSelection onSelect={handleServiceSelect} />
                )}

                {step === 'date' && (
                    <Calendar
                        onSelect={handleDateSelect}
                        onBack={() => setStep('service')}
                    />
                )}

                {step === 'contact' && (
                    <ContactForm
                        onSubmit={handleContactSubmit}
                        onBack={() => setStep('date')}
                    />
                )}
            </Card>

            {/* Progress Indicators (Minimalist) */}
            <div className="flex justify-center gap-2 mt-8">
                <div className={`h-0.5 transition-all duration-300 ${step === 'service' ? 'w-8 bg-stone-800' : 'w-4 bg-stone-200'}`} />
                <div className={`h-0.5 transition-all duration-300 ${step === 'date' ? 'w-8 bg-stone-800' : 'w-4 bg-stone-200'}`} />
                <div className={`h-0.5 transition-all duration-300 ${step === 'contact' ? 'w-8 bg-stone-800' : 'w-4 bg-stone-200'}`} />
            </div>
        </div>
    );
}
