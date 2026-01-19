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
}

export default function PdfExportButton({ property, settings }: PdfExportButtonProps) {
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
            // Dynamic imports for better performance
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');

            // Create a hidden container for the PDF content
            const container = document.createElement('div');
            container.style.cssText = `
                position: absolute;
                left: -9999px;
                top: 0;
                width: 800px;
                background: white;
                font-family: Arial, sans-serif;
            `;

            // Build PDF content HTML
            const mainPhoto = property.photos[0]?.url || '';
            const photoGrid = property.photos.slice(1, 5).map(p => p.url);

            container.innerHTML = `
                <div style="padding: 40px;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid ${settings.primaryColor};">
                        <div>
                            ${settings.logoUrl
                    ? `<img src="${settings.logoUrl}" alt="Logo" style="max-height: 60px; max-width: 200px;" crossorigin="anonymous" />`
                    : `<h1 style="margin: 0; color: ${settings.primaryColor}; font-size: 28px;">${settings.companyName}</h1>`
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
                            <img src="${mainPhoto}" alt="${property.title}" style="width: 100%; height: 350px; object-fit: cover;" crossorigin="anonymous" />
                        </div>
                    ` : ''}

                    <!-- Title and Price -->
                    <div style="margin-bottom: 25px;">
                        <h2 style="margin: 0 0 10px 0; color: ${settings.primaryColor}; font-size: 24px;">${property.title}</h2>
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

                    <!-- Photo Grid -->
                    ${photoGrid.length > 0 ? `
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 25px;">
                            ${photoGrid.map(url => `
                                <div style="border-radius: 8px; overflow: hidden;">
                                    <img src="${url}" alt="Foto" style="width: 100%; height: 120px; object-fit: cover;" crossorigin="anonymous" />
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Description -->
                    <div style="margin-bottom: 25px;">
                        <h3 style="margin: 0 0 10px 0; color: ${settings.primaryColor}; font-size: 16px;">Descrição</h3>
                        <p style="margin: 0; color: #444; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${property.characteristics}</p>
                    </div>

                    <!-- Footer -->
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 11px;">
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

            // Small delay for rendering
            await new Promise(resolve => setTimeout(resolve, 500));

            // Generate canvas
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
            });

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(
                canvas.toDataURL('image/jpeg', 0.95),
                'JPEG',
                0,
                0,
                imgWidth,
                imgHeight
            );

            // If content is longer than one page, handle overflow
            if (imgHeight > 297) {
                let heightLeft = imgHeight - 297;
                let position = -297;

                while (heightLeft > 0) {
                    pdf.addPage();
                    pdf.addImage(
                        canvas.toDataURL('image/jpeg', 0.95),
                        'JPEG',
                        0,
                        position,
                        imgWidth,
                        imgHeight
                    );
                    heightLeft -= 297;
                    position -= 297;
                }
            }

            // Download
            const filename = `${property.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            pdf.save(filename);

            // Cleanup
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
            className={styles.button}
        >
            {generating ? '⏳ Gerando...' : '📄 Gerar PDF'}
        </button>
    );
}
