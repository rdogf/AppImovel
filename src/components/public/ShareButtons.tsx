'use client';

import { useState } from 'react';
import styles from './ShareButtons.module.css';

interface ShareButtonsProps {
    propertyUrl: string;
    shareMessage: string;
    whatsappNumber?: string | null;
}

export default function ShareButtons({ propertyUrl, shareMessage, whatsappNumber }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const whatsappUrl = whatsappNumber
        ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(shareMessage)}`
        : `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

    const emailSubject = shareMessage.split(' - ')[0];
    const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(shareMessage)}`;

    const handleCopy = async () => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(propertyUrl);
            } else {
                // Fallback for non-secure contexts (HTTP)
                const textArea = document.createElement("textarea");
                textArea.value = propertyUrl;

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
                    alert("Não foi possível copiar automaticamente. Selecione e copie manualamente: " + propertyUrl);
                    return;
                } finally {
                    document.body.removeChild(textArea);
                }
            }

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy logic:', error);
            alert("Erro ao copiar link: " + propertyUrl);
        }
    };

    return (
        <div className={styles.shareButtons}>
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
                data-type="whatsapp"
            >
                <span>📱</span> WhatsApp
            </a>
            <a
                href={emailUrl}
                className={styles.shareBtn}
                data-type="email"
            >
                <span>✉️</span> E-mail
            </a>
            <button
                type="button"
                className={styles.shareBtn}
                data-type="copy"
                onClick={handleCopy}
            >
                <span>{copied ? '✅' : '🔗'}</span> {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
        </div>
    );
}
