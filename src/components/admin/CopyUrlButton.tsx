'use client';

import { useState } from 'react';

export default function CopyUrlButton({ propertyId }: { propertyId: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const url = `${window.location.origin}/imovel/${propertyId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="btn btn-outline"
            style={{
                marginRight: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
            }}
        >
            {copied ? '✅  Copiado!' : '📋  Copiar Link Público'}
        </button>
    );
}
