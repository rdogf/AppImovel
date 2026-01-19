'use client';

import { useState } from 'react';
import styles from '../public/PdfExportButton.module.css';

interface PropertyPdfButtonProps {
    property: {
        id: string;
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
    };
    settings: {
        companyName: string;
        logoUrl: string | null;
        primaryColor: string;
        whatsappNumber: string | null;
        email: string | null;
    };
}

export default function PropertyPdfButton({ property, settings }: PropertyPdfButtonProps) {
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
                width: 794px;
                background: white;
                font-family: Arial, sans-serif;
            `;

            const mainPhoto = property.photos[0]?.url || '';
            const allPhotos = property.photos.slice(1); // All except first

            // Create photo grid (2 columns, 3 rows per "page section")
            const photoGridHtml = allPhotos.length > 0 ? `
                <div style="margin-top: 25px; page-break-inside: avoid;">
                    <h3 style="margin: 0 0 15px 0; color: ${settings.primaryColor}; font-size: 16px; border-bottom: 2px solid ${settings.primaryColor}; padding-bottom: 8px;">📸 Mais Fotos (${allPhotos.length})</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                        ${allPhotos.map(p => `
                            <div style="border-radius: 8px; overflow: hidden; background: #f0f0f0;">
                                <img src="${p.url}" alt="Foto" style="width: 100%; height: 200px; object-fit: cover; display: block;" />
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '';

            container.innerHTML = `
                <div style="padding: 30px; background: white;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid ${settings.primaryColor};">
                        <div>
                            ${settings.logoUrl
                    ? `<img src="${settings.logoUrl}" alt="Logo" style="max-height: 50px; max-width: 180px;" />`
                    : `<h1 style="margin: 0; color: ${settings.primaryColor}; font-size: 24px;">${settings.companyName}</h1>`
                }
                        </div>
                        <div style="text-align: right; color: #666; font-size: 12px;">
                            ${settings.whatsappNumber ? `📱 ${settings.whatsappNumber}<br>` : ''}
                            ${settings.email || ''}
                        </div>
                    </div>

                    <!-- Main Photo -->
                    ${mainPhoto ? `
                        <div style="margin-bottom: 20px; border-radius: 12px; overflow: hidden;">
                            <img src="${mainPhoto}" alt="${property.title}" style="width: 100%; height: 350px; object-fit: cover; display: block;" />
                        </div>
                    ` : ''}

                    <!-- Title and Price -->
                    <div style="margin-bottom: 20px;">
                        <h2 style="margin: 0 0 8px 0; color: ${settings.primaryColor}; font-size: 24px;">${property.title}</h2>
                        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">📍 ${property.address}, ${property.neighborhood} - ${property.city}/${property.state}</p>
                        <p style="margin: 0; color: #e94560; font-size: 28px; font-weight: bold;">${formatCurrency(property.price)}</p>
                        ${property.condoFee ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Condomínio: ${formatCurrency(property.condoFee)}/mês</p>` : ''}
                    </div>

                    <!-- Features Grid -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 12px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px;">📐</div>
                            <div style="font-size: 18px; font-weight: bold; color: ${settings.primaryColor};">${property.totalArea}m²</div>
                            <div style="font-size: 11px; color: #666;">Área Total</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px;">🛏️</div>
                            <div style="font-size: 18px; font-weight: bold; color: ${settings.primaryColor};">${property.bedrooms}</div>
                            <div style="font-size: 11px; color: #666;">Quartos</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px;">🚿</div>
                            <div style="font-size: 18px; font-weight: bold; color: ${settings.primaryColor};">${property.bathrooms}</div>
                            <div style="font-size: 11px; color: #666;">Banheiros</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px;">🚗</div>
                            <div style="font-size: 18px; font-weight: bold; color: ${settings.primaryColor};">${property.parkingSpaces}</div>
                            <div style="font-size: 11px; color: #666;">Vagas</div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div style="margin-bottom: 20px;">
                        <h3 style="margin: 0 0 10px 0; color: ${settings.primaryColor}; font-size: 16px;">Descrição</h3>
                        <p style="margin: 0; color: #444; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${property.characteristics}</p>
                    </div>

                    <!-- Photo Grid -->
                    ${photoGridHtml}

                    <!-- Footer -->
                    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 11px;">
                        <p style="margin: 0;">Documento gerado por ${settings.companyName}</p>
                        ${settings.whatsappNumber ? `<p style="margin: 5px 0 0 0;">Entre em contato: ${settings.whatsappNumber}</p>` : ''}
                    </div>
                </div>
            `;

            document.body.appendChild(container);

            // Wait for images
            const images = container.querySelectorAll('img');
            await Promise.all(Array.from(images).map(img => {
                return new Promise<void>((resolve) => {
                    if (img.complete) resolve();
                    else {
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                    }
                });
            }));

            await new Promise(resolve => setTimeout(resolve, 300));

            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
            });

            // Simple single-image PDF
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidth = 210;
            const pageHeight = 297;
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add first page
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, imgWidth, imgHeight);

            // If needs more pages
            let y = pageHeight;
            while (y < imgHeight) {
                pdf.addPage();
                pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, -y, imgWidth, imgHeight);
                y += pageHeight;
            }

            pdf.save(`${property.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            document.body.removeChild(container);

        } catch (error) {
            console.error('PDF error:', error);
            alert('Erro ao gerar PDF');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <button
            type="button"
            onClick={generatePdf}
            disabled={generating}
            className={`${styles.button} ${styles.small}`}
            title="Gerar PDF"
        >
            {generating ? '⏳' : '📄'}
        </button>
    );
}
