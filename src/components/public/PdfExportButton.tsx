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

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();

            const addPageToPdf = async (htmlContent: string, isFirstPage: boolean = false) => {
                const container = document.createElement('div');
                container.style.cssText = `
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 794px;
                    background: white;
                    font-family: Arial, sans-serif;
                    z-index: -9999;
                `;
                container.innerHTML = htmlContent;
                document.body.appendChild(container);

                await new Promise(resolve => setTimeout(resolve, 500));

                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                });

                if (!isFirstPage) {
                    pdf.addPage();
                }

                const imgData = canvas.toDataURL('image/png');
                const imgHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);

                document.body.removeChild(container);
            };

            const mainPhoto = property.photos[0]?.url || '';
            const otherPhotos = property.photos.slice(1);

            // PAGE 1
            const page1Html = `
                <div style="padding: 30px; background: white; min-height: 1100px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid ${settings.primaryColor};">
                        <div>
                            <h1 style="margin: 0; color: ${settings.primaryColor}; font-size: 24px;">${settings.companyName}</h1>
                        </div>
                        <div style="text-align: right; color: #666; font-size: 12px;">
                            ${settings.whatsappNumber ? `📱 ${settings.whatsappNumber}<br>` : ''}
                            ${settings.email || ''}
                        </div>
                    </div>

                    ${mainPhoto ? `
                        <div style="margin-bottom: 20px; border-radius: 8px; overflow: hidden; background: #eee;">
                            <img src="${mainPhoto}" style="width: 100%; height: 350px; object-fit: cover; display: block;" crossorigin="anonymous" />
                        </div>
                    ` : ''}

                    <div style="margin-bottom: 20px;">
                        <h2 style="margin: 0 0 8px 0; color: ${settings.primaryColor}; font-size: 24px;">${property.title}</h2>
                        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">📍 ${property.address}, ${property.neighborhood} - ${property.city}/${property.state}</p>
                        <p style="margin: 0; color: #e94560; font-size: 28px; font-weight: bold;">${formatCurrency(property.price)}</p>
                        ${property.condoFee ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Condomínio: ${formatCurrency(property.condoFee)}/mês</p>` : ''}
                    </div>

                    <div style="display: flex; justify-content: space-around; margin-bottom: 25px; padding: 20px; background: #f5f5f5; border-radius: 10px;">
                        <div style="text-align: center;"><div style="font-size: 24px;">📐</div><div style="font-size: 18px; font-weight: bold;">${property.totalArea}m²</div><div style="font-size: 11px; color: #666;">Área Total</div></div>
                        <div style="text-align: center;"><div style="font-size: 24px;">🛏️</div><div style="font-size: 18px; font-weight: bold;">${property.bedrooms}</div><div style="font-size: 11px; color: #666;">Quartos</div></div>
                        <div style="text-align: center;"><div style="font-size: 24px;">🚿</div><div style="font-size: 18px; font-weight: bold;">${property.bathrooms}</div><div style="font-size: 11px; color: #666;">Banheiros</div></div>
                        <div style="text-align: center;"><div style="font-size: 24px;">🚗</div><div style="font-size: 18px; font-weight: bold;">${property.parkingSpaces}</div><div style="font-size: 11px; color: #666;">Vagas</div></div>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h3 style="margin: 0 0 10px 0; color: ${settings.primaryColor}; font-size: 16px; border-bottom: 2px solid ${settings.primaryColor}; padding-bottom: 5px;">Descrição</h3>
                        <p style="margin: 0; color: #444; font-size: 13px; line-height: 1.6;">${property.characteristics}</p>
                    </div>

                    <div style="margin-top: auto; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 10px;">
                        Documento gerado por ${settings.companyName} ${settings.whatsappNumber ? `| ${settings.whatsappNumber}` : ''}
                    </div>
                </div>
            `;

            await addPageToPdf(page1Html, true);

            // PHOTO PAGES: 6 photos per page (2x3 grid)
            const photosPerPage = 6;
            const photoPages = Math.ceil(otherPhotos.length / photosPerPage);

            for (let pageIdx = 0; pageIdx < photoPages; pageIdx++) {
                const startIdx = pageIdx * photosPerPage;
                const pagePhotos = otherPhotos.slice(startIdx, startIdx + photosPerPage);

                const photoPageHtml = `
                    <div style="padding: 30px; background: white; min-height: 1100px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid ${settings.primaryColor};">
                            <h3 style="margin: 0; color: ${settings.primaryColor}; font-size: 16px;">📸 Fotos - ${property.title}</h3>
                            <span style="color: #666; font-size: 12px;">Página ${pageIdx + 2} de ${photoPages + 1}</span>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                            ${pagePhotos.map(p => `
                                <div style="border-radius: 8px; overflow: hidden; background: #fff; height: 260px; display: flex; align-items: center; justify-content: center; border: 1px solid #eee;">
                                    <img src="${p.url}" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;" crossorigin="anonymous" />
                                </div>
                            `).join('')}
                        </div>

                        <div style="position: absolute; bottom: 30px; left: 30px; right: 30px; text-align: center; color: #888; font-size: 10px; border-top: 1px solid #ddd; padding-top: 10px;">
                            ${settings.companyName} ${settings.whatsappNumber ? `| ${settings.whatsappNumber}` : ''}
                        </div>
                    </div>
                `;

                await addPageToPdf(photoPageHtml, false);
            }

            const fileName = property.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
            pdf.save(`${fileName}.pdf`);

        } catch (error) {
            console.error('Erro PDF:', error);
            alert('Erro ao gerar PDF. Verifique o console.');
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
