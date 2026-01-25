'use client';

import { useState } from 'react';

interface PropertySummary {
    id: string;
    title: string;
}

interface ClonePropertySelectProps {
    properties: PropertySummary[];
    onSelect: (id: string) => void;
}

export default function ClonePropertySelect({ properties, onSelect }: ClonePropertySelectProps) {
    return (
        <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <label htmlFor="cloneProperty" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>
                📂 Importar dados de outro imóvel (opcional)
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
                <select
                    id="cloneProperty"
                    onChange={(e) => onSelect(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ced4da',
                        fontSize: '14px'
                    }}
                >
                    <option value="">Selecione um imóvel para copiar...</option>
                    {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
            </div>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
                Isso preencherá os campos abaixo com os dados do imóvel selecionado.
            </p>
        </div>
    );
}
