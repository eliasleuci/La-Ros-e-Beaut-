export const DAYS_IN_WEEK = 7;
export const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const SPAIN_TZ = 'Europe/Madrid';

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

/**
 * Returns the current date/time anchored to Spain timezone
 */
export function getSpainNow(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: SPAIN_TZ }));
}

/**
 * Formats a date for display
 * Extracts date directly from ISO string to avoid timezone conversion issues
 */
export function formatDate(date: Date | string): string {
    let dateStr: string;

    if (typeof date === 'string') {
        // Extract YYYY-MM-DD from ISO string (e.g., "2025-12-29T14:00:00+01:00")
        dateStr = date.split('T')[0];
    } else {
        // For Date objects, convert to Spain timezone first
        dateStr = toSpainDateString(date);
    }

    // Parse the YYYY-MM-DD string
    const [year, monthNum, day] = dateStr.split('-').map(Number);
    return `${day} de ${MONTHS[monthNum - 1]}`;
}

export function generateTimeSlots(startHour: number = 10, endHour: number = 20): string[] {
    const slots = [];
    for (let i = startHour; i < endHour; i++) {
        slots.push(`${i}:00`);
        slots.push(`${i}:30`);
    }
    return slots;
}

/**
 * Checks if a date is a Spanish national holiday (2025/2026 common)
 */
export function isSpanishHoliday(date: Date): boolean {
    const dateStr = toSpainDateString(date);
    const [, month, day] = dateStr.split('-').map(Number);

    // Static list of major Spanish National holidays (Month is 1-indexed from string)
    const holidays = [
        "01-01", // Año Nuevo
        "01-06", // Reyes
        "05-01", // Fiesta del Trabajo
        "08-15", // Asunción
        "10-12", // Fiesta Nacional
        "11-01", // Todos los Santos
        "12-06", // Constitución
        "12-08", // Inmaculada
        "12-25", // Navidad
    ];

    const currentDayMonth = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return holidays.includes(currentDayMonth);
}

/**
 * Checks if two dates are the same day in Spain timezone
 */
export function isSameDay(d1: Date, d2: Date): boolean {
    const s1 = toSpainDateString(d1);
    const s2 = toSpainDateString(d2);
    return s1 === s2;
}

/**
 * Checks if a date is in the past relative to Spain "today"
 */
export function isPastDate(date: Date): boolean {
    const todayStr = toSpainDateString(getSpainNow());
    const dateStr = toSpainDateString(date);

    // Compare YYYY-MM-DD strings to ignore time
    return dateStr < todayStr;
}

/**
 * Checks if a date falls on a weekend in Spain timezone
 */
export function isWeekend(date: Date): boolean {
    const localizedDate = new Date(date.toLocaleString('en-US', { timeZone: SPAIN_TZ }));
    const day = localizedDate.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Returns a date string in YYYY-MM-DD format based on Spain timezone
 */
export function toSpainDateString(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        timeZone: SPAIN_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    return formatter.format(date);
}

/**
 * Normalizes a date to 00:00:00 in Spain timezone for comparison
 */
export function normalizeToSpain(date: Date): Date {
    const dateStr = toSpainDateString(date);
    // Standard Spain offset is +01:00 (CET) or +02:00 (CEST)
    // For simplicity, we use the date anchor.
    return new Date(`${dateStr}T00:00:00+01:00`);
}
