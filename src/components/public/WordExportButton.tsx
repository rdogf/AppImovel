'use client';

import { useState } from 'react';
import styles from './PdfExportButton.module.css';
import { formatOutstandingBalance } from '@/lib/utils';

interface PropertyData {
    id?: string;
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
    outstandingBalance: number | null;
    outstandingBalanceRef?: string | null;
    status: string;
    photos: { url: string }[];
}

interface SettingsData {
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    whatsappNumber: string | null;
    email: string | null;
}

interface WordExportButtonProps {
    property: PropertyData;
    settings: SettingsData;
    variant?: 'default' | 'small';
}

interface CompressedImage {
    data: Uint8Array;
    width: number;
    height: number;
}

// Reduz a foto (máx. 1000px de largura, JPEG 70%) para o .docx ficar leve
async function compressImage(url: string, maxWidth = 1000): Promise<CompressedImage | null> {
    try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        await img.decode();

        const scale = Math.min(1, maxWidth / img.naturalWidth);
        const width = Math.round(img.naturalWidth * scale);
        const height = Math.round(img.naturalHeight * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.7));
        if (!blob) return null;
        return { data: new Uint8Array(await blob.arrayBuffer()), width, height };
    } catch {
        return null;
    }
}

const hex = (color: string) => color.replace('#', '').slice(0, 6) || '1a1a2e';

export default function WordExportButton({ property, settings, variant = 'default' }: WordExportButtonProps) {
    const [generating, setGenerating] = useState(false);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const generateWord = async () => {
        setGenerating(true);

        try {
            const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, BorderStyle } = await import('docx');

            const primary = hex(settings.primaryColor);
            const accent = hex(settings.accentColor);

            // Largura útil da página A4 com margens padrão ≈ 600px
            const pageWidth = 600;
            const fit = (img: CompressedImage, maxW: number) => ({
                width: maxW,
                height: Math.round((img.height * maxW) / img.width),
            });

            const children: InstanceType<typeof Paragraph>[] = [];

            // Cabeçalho
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: settings.companyName, bold: true, size: 32, color: primary })],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: [settings.whatsappNumber, settings.email].filter(Boolean).join('  |  '),
                            size: 18,
                            color: '666666',
                        }),
                    ],
                    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: primary, space: 4 } },
                    spacing: { after: 200 },
                }),
            );

            // Foto principal
            const [mainPhoto, ...otherPhotos] = property.photos;
            if (mainPhoto) {
                const img = await compressImage(mainPhoto.url);
                if (img) {
                    children.push(
                        new Paragraph({
                            children: [new ImageRun({ type: 'jpg', data: img.data, transformation: fit(img, pageWidth) })],
                            spacing: { after: 200 },
                        }),
                    );
                }
            }

            // Título, endereço e valores
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: property.title, bold: true, size: 32, color: primary })],
                    spacing: { after: 80 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${property.address}, ${property.neighborhood} - ${property.city}/${property.state}`,
                            size: 20,
                            color: '666666',
                        }),
                    ],
                    spacing: { after: 120 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: formatCurrency(property.price), bold: true, size: 36, color: accent })],
                }),
            );

            const extras = [
                property.condoFee ? `Condomínio: ${formatCurrency(property.condoFee)}/mês` : null,
                property.iptu ? `IPTU: ${formatCurrency(property.iptu)}/ano` : null,
                property.outstandingBalance != null ? `Saldo devedor: ${formatOutstandingBalance(property.outstandingBalance, property.outstandingBalanceRef)}` : null,
            ].filter(Boolean) as string[];
            for (const text of extras) {
                children.push(new Paragraph({ children: [new TextRun({ text, size: 18, color: '666666' })] }));
            }

            // Características
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Área: ${property.totalArea}m²   •   Quartos: ${property.bedrooms}   •   Banheiros: ${property.bathrooms}   •   Vagas: ${property.parkingSpaces}`,
                            bold: true,
                            size: 22,
                            color: primary,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    shading: { fill: 'F5F5F5' },
                    spacing: { before: 240, after: 240 },
                }),
            );

            // Descrição
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: 'Descrição', bold: true, size: 24, color: primary })],
                    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: primary, space: 2 } },
                    spacing: { after: 120 },
                }),
                ...property.characteristics
                    .split('\n')
                    .map((line) => new Paragraph({ children: [new TextRun({ text: line, size: 20, color: '444444' })] })),
            );

            // Demais fotos, duas por linha
            if (otherPhotos.length > 0) {
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: 'Fotos', bold: true, size: 24, color: primary })],
                        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: primary, space: 2 } },
                        spacing: { before: 300, after: 120 },
                    }),
                );

                const halfWidth = Math.floor(pageWidth / 2) - 6;
                const compressed = (await Promise.all(otherPhotos.map((p) => compressImage(p.url, 700)))).filter(
                    (img): img is CompressedImage => img !== null,
                );
                for (let i = 0; i < compressed.length; i += 2) {
                    const pair = compressed.slice(i, i + 2);
                    children.push(
                        new Paragraph({
                            children: pair.flatMap((img, idx) => [
                                ...(idx > 0 ? [new TextRun({ text: '  ' })] : []),
                                new ImageRun({ type: 'jpg', data: img.data, transformation: fit(img, halfWidth) }),
                            ]),
                            spacing: { after: 120 },
                        }),
                    );
                }
            }

            // Rodapé
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Documento gerado por ${settings.companyName}${settings.whatsappNumber ? ` | ${settings.whatsappNumber}` : ''}`,
                            size: 16,
                            color: '888888',
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 300 },
                }),
            );

            const doc = new Document({
                styles: { default: { document: { run: { font: 'Arial' } } } },
                sections: [{ children }],
            });

            const blob = await Packer.toBlob(doc);
            const fileName = property.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'ficha';
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}.docx`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Erro Word:', error);
            alert('Erro ao gerar o arquivo Word. Verifique o console.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <button
            type="button"
            onClick={generateWord}
            disabled={generating}
            className={`${styles.button} ${variant === 'small' ? styles.small : ''}`}
            title="Gerar Word"
        >
            {generating ? '⏳' : '📝'} {variant !== 'small' && (generating ? 'Gerando...' : 'Gerar Word')}
        </button>
    );
}
