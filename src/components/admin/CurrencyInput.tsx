'use client';

import { useState } from 'react';

/**
 * Converte texto no formato brasileiro (ex: "314.331,48" ou "428.000") em número.
 * Regras: pontos são separadores de milhar (removidos), vírgula é o decimal.
 */
function toNumber(text: string): number | null {
    if (!text.trim()) return null;
    const normalized = text.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const n = parseFloat(normalized);
    return Number.isFinite(n) ? n : null;
}

/** Formata um número no padrão brasileiro: 314331.48 -> "314.331,48" */
function formatBRL(n: number): string {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface CurrencyInputProps {
    id?: string;
    name: string;
    defaultValue?: number | null;
    required?: boolean;
    placeholder?: string;
    className?: string;
}

/**
 * Campo de valor em Reais. O usuário digita no formato brasileiro
 * ("428.000,00", "314.331,48") e o valor numérico limpo ("428000", "314331.48")
 * é enviado no formulário através de um input oculto com o `name` informado.
 */
export default function CurrencyInput({
    id,
    name,
    defaultValue,
    required = false,
    placeholder = '0,00',
    className = 'form-input',
}: CurrencyInputProps) {
    const [text, setText] = useState(
        defaultValue != null && Number.isFinite(defaultValue) ? formatBRL(defaultValue) : ''
    );

    const numeric = toNumber(text);

    return (
        <>
            <input
                type="text"
                inputMode="decimal"
                id={id}
                className={className}
                value={text}
                placeholder={placeholder}
                required={required}
                autoComplete="off"
                onChange={(e) => setText(e.target.value.replace(/[^\d.,]/g, ''))}
                onBlur={() => {
                    if (numeric != null) setText(formatBRL(numeric));
                }}
            />
            {/* Valor numérico enviado ao servidor (ponto como decimal) */}
            <input type="hidden" name={name} value={numeric != null ? String(numeric) : ''} />
        </>
    );
}
