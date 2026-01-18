import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function for conditional class names
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Format currency to Brazilian Real
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/**
 * Format number with Brazilian locale
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Format area in square meters
 */
export function formatArea(value: number): string {
    return `${formatNumber(value)}m²`;
}

/**
 * Generate WhatsApp share URL
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Generate email share URL
 */
export function generateEmailUrl(to: string, subject: string, body: string): string {
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Get property status label in Portuguese
 */
export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        disponivel: 'Disponível',
        vendido: 'Vendido',
        reservado: 'Reservado',
        alugado: 'Alugado',
    };
    return labels[status] || status;
}

/**
 * Get property type label in Portuguese
 */
export function getPropertyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        apartamento: 'Apartamento',
        casa: 'Casa',
        cobertura: 'Cobertura',
        terreno: 'Terreno',
        sala_comercial: 'Sala Comercial',
        loja: 'Loja',
        galpao: 'Galpão',
    };
    return labels[type] || type;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone format (Brazilian)
 */
export function isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Format phone number (Brazilian format)
 */
export function formatPhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
        return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (clean.length === 10) {
        return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
}

/**
 * Delay function for animations
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random string for IDs
 */
export function generateId(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
