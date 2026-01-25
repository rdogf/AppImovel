'use client';

import { useState } from 'react';

export default function CopyUrlButton({ propertyId }: { propertyId: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const url = `${window.location.origin}/imovel/${propertyId}`;

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for non-secure contexts (HTTP)
                const textArea = document.createElement("textarea");
                textArea.value = url;

                // Ensure it's not visible but part of the DOM
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                    alert("Não foi possível copiar automaticamente. Selecione e copie manualamente: " + url);
                    return;
                } finally {
                    document.body.removeChild(textArea);
                }
            }

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert("Erro ao copiar link: " + url);
        }
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
