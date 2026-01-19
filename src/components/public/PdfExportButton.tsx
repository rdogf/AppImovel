'use client';

import { useState } from 'react';
import styles from './PdfExportButton.module.css';

interface PropertyData {
    title: string;
    address: string;
    neighborhood: string;
    city: string;
    state: string;
    totalArea: number;
    propertyType: string;
    bedrooms: number;
    suites: number;
    bathrooms: number;
    parkingSpaces: number;
    characteristics: string;
    price: number;
    condoFee: number | null;
    iptu: number | null;
    status: string;
    photos: { url: string }[];
}

interface SettingsData {
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
    whatsappNumber: string | null;
    email: string | null;
}

interface PdfExportButtonProps {
    property: PropertyData;
    settings: SettingsData;
    variant?: 'default' | 'small';
}

export default function PdfExportButton({ property, settings, variant = 'default' }: PdfExportButtonProps) {
    const [generating, setGenerating] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const generatePdf = async () => {
        setGenerating(true);

        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');

            const container = document.createElement('div');
            container.style.cssText = `
                position: absolute;
                left: -9999px;
                top: 0;
                width: 800px;
                background: white;
                font-family: Arial, sans-serif;
            `;

            const mainPhoto = property.photos[0]?.url || '';
            const allPhotos = property.photos.map(p => p.url);

            // Create photo grid HTML for all photos (3 per row)
            const photoGridHtml = allPhotos.length > 1 ? `
                <div style="margin-top: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: ${settings.primaryColor}; font-size: 14px;">📸 Galeria de Fotos (${allPhotos.length})</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        ${allPhotos.map(url => `
                            <div style="border-radius: 8px; overflow: hidden; aspect-ratio: 4/3;">
                                <img src="${url}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover;" crossorigin="anonymous" />
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '';

            container.innerHTML = `
                <div style="padding: 40px;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 3px solid ${settings.primaryColor};">
                        <div>
                            ${settings.logoUrl
                    ? `<img src="${settings.logoUrl}" alt="Logo" style="max-height: 50px; max-width: 180px;" crossorigin="anonymous" />`
                    : `<h1 style="margin: 0; color: ${settings.primaryColor}; font-size: 24px;">${settings.companyName}</h1>`
                }
                        </div>
                        <div style="text-align: right; color: #666; font-size: 11px;">
                            ${settings.whatsappNumber ? `📱 ${settings.whatsappNumber}<br>` : ''}
                            ${settings.email || ''}
                        </div>
                    </div>

                    <!-- Main Photo -->
                    ${mainPhoto ? `
                        <div style="margin-bottom: 20px; border-radius: 12px; overflow: hidden;">
                            <img src="${mainPhoto}" alt="${property.title}" style="width: 100%; height: 300px; object-fit: cover;" crossorigin="anonymous" />
                        </div>
                    ` : ''}

                    <!-- Title and Price -->
                    <div style="margin-bottom: 20px;">
                        <h2 style="margin: 0 0 8px 0; color: ${settings.primaryColor}; font-size: 22px;">${property.title}</h2>
                        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">📍 ${property.address}, ${property.neighborhood} - ${property.city}/${property.state}</p>
                        <p style="margin: 0; color: #e94560; font-size: 26px; font-weight: bold;">${formatCurrency(property.price)}</p>
                        ${property.condoFee ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 11px;">Condomínio: ${formatCurrency(property.condoFee)}/mês</p>` : ''}
                    </div>

                    <!-- Features Grid -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 12px;">
                        <div style="text-align: center;">
                            <div style="font-size: 20px;">📐</div>
                            <div style="font-size: 16px; font-weight: bold; color: ${settings.primaryColor};">${property.totalArea}m²</div>
                            <div style="font-size: 10px; color: #666;">Área Total</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 20px;">🛏️</div>
                            <div style="font-size: 16px; font-weight: bold; color: ${settings.primaryColor};">${property.bedrooms}</div>
                            <div style="font-size: 10px; color: #666;">Quartos</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 20px;">🚿</div>
                            <div style="font-size: 16px; font-weight: bold; color: ${settings.primaryColor};">${property.bathrooms}</div>
                            <div style="font-size: 10px; color: #666;">Banheiros</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 20px;">🚗</div>
                            <div style="font-size: 16px; font-weight: bold; color: ${settings.primaryColor};">${property.parkingSpaces}</div>
                            <div style="font-size: 10px; color: #666;">Vagas</div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div style="margin-bottom: 20px;">
                        <h3 style="margin: 0 0 10px 0; color: ${settings.primaryColor}; font-size: 14px;">Descrição</h3>
                        <p style="margin: 0; color: #444; font-size: 12px; line-height: 1.5; white-space: pre-wrap;">${property.characteristics}</p>
                    </div>

                    <!-- All Photos Grid -->
                    ${photoGridHtml}

                    <!-- Footer -->
                    <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 10px;">
                        <p style="margin: 0;">Documento gerado por ${settings.companyName}</p>
                        ${settings.whatsappNumber ? `<p style="margin: 5px 0 0 0;">Entre em contato: ${settings.whatsappNumber}</p>` : ''}
                    </div>
                </div>
            `;

            document.body.appendChild(container);

            // Wait for images to load
            const images = container.querySelectorAll('img');
            await Promise.all(Array.from(images).map(img => {
                return new Promise<void>((resolve) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                    }
                });
            }));

            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pageWidth = 210;
            const pageHeight = 297;
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // If content fits on one page
            if (imgHeight <= pageHeight) {
                pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, imgWidth, imgHeight);
            } else {
                // Multiple pages needed - slice the canvas
                const totalPages = Math.ceil(imgHeight / pageHeight);
                const sourceHeight = canvas.height / totalPages;

                for (let i = 0; i < totalPages; i++) {
                    if (i > 0) pdf.addPage();

                    // Create a canvas for this page slice
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvas.width;
                    pageCanvas.height = sourceHeight;

                    const ctx = pageCanvas.getContext('2d');
                    if (ctx) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                        ctx.drawImage(
                            canvas,
                            0, i * sourceHeight, canvas.width, sourceHeight,
                            0, 0, pageCanvas.width, pageCanvas.height
                        );
                    }

                    pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, imgWidth, pageHeight);
                }
            }

            const filename = `${property.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            pdf.save(filename);

            document.body.removeChild(container);

        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <button
            type="button"
            onClick={generatePdf}
            disabled={generating}
            className={`${styles.button} ${variant === 'small' ? styles.small : ''}`}
            title="Gerar PDF"
        >
            {generating ? '⏳' : '📄'} {variant !== 'small' && (generating ? 'Gerando...' : 'Gerar PDF')}
        </button>
    );
}
