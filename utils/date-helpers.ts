export const DAYS_IN_WEEK = 7;
export const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const ARGENTINA_TZ = 'America/Argentina/Buenos_Aires';

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

/**
 * Returns the current date/time anchored to Argentina timezone
 */
export function getArgentinaNow(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: ARGENTINA_TZ }));
}

/**
 * Formats a date for display
 * Extracts date directly from ISO string to avoid timezone conversion issues
 */
export function formatDate(date: Date | string): string {
    let dateStr: string;

    if (typeof date === 'string') {
        // Extract YYYY-MM-DD from ISO string (e.g., "2025-12-29T14:00:00-03:00" or "2025-12-29T17:00:00.000Z")
        dateStr = date.split('T')[0];
    } else {
        // For Date objects, convert to Argentina timezone first
        dateStr = toArgentinaDateString(date);
    }

    // Parse the YYYY-MM-DD string
    const [year, monthNum, day] = dateStr.split('-').map(Number);
    return `${day} de ${MONTHS[monthNum - 1]}`;
}

export function generateTimeSlots(startHour: number = 9, endHour: number = 19): string[] {
    const slots = [];
    for (let i = startHour; i < endHour; i++) {
        slots.push(`${i}:00`);
        slots.push(`${i}:30`);
    }
    return slots;
}

/**
 * Checks if two dates are the same day in Argentina timezone
 */
export function isSameDay(d1: Date, d2: Date): boolean {
    const s1 = toArgentinaDateString(d1);
    const s2 = toArgentinaDateString(d2);
    return s1 === s2;
}

/**
 * Checks if a date is in the past relative to Argentina "today"
 */
export function isPastDate(date: Date): boolean {
    const todayStr = toArgentinaDateString(getArgentinaNow());
    const dateStr = toArgentinaDateString(date);

    // Compare YYYY-MM-DD strings to ignore time
    return dateStr < todayStr;
}

/**
 * Checks if a date falls on a weekend in Argentina timezone
 */
export function isWeekend(date: Date): boolean {
    const localizedDate = new Date(date.toLocaleString('en-US', { timeZone: ARGENTINA_TZ }));
    const day = localizedDate.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Returns a date string in YYYY-MM-DD format based on Argentina timezone
 */
export function toArgentinaDateString(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        timeZone: ARGENTINA_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    return formatter.format(date);
}

/**
 * Normalizes a date to 00:00:00 in Argentina timezone for comparison
 */
export function normalizeToArgentina(date: Date): Date {
    const dateStr = toArgentinaDateString(date);
    return new Date(`${dateStr}T00:00:00-03:00`);
}
