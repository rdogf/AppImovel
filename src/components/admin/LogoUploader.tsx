'use client';

import { useState, useRef } from 'react';
import styles from './LogoUploader.module.css';

interface LogoUploaderProps {
    currentLogo: string | null;
    inputName: string;
    label: string;
    recommendedSize: string;
}

export default function LogoUploader({ currentLogo, inputName, label, recommendedSize }: LogoUploaderProps) {
    const [preview, setPreview] = useState<string | null>(currentLogo);
    const [logoUrl, setLogoUrl] = useState<string>(currentLogo || '');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecione uma imagem');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('Imagem muito grande. Máximo 2MB.');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'logo');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.urls && data.urls.length > 0) {
                const url = data.urls[0];
                setPreview(url);
                setLogoUrl(url);
            } else {
                setError('Erro ao fazer upload');
            }
        } catch (err) {
            setError('Erro ao fazer upload');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setLogoUrl('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={styles.container}>
            <label className="form-label">{label}</label>

            <div className={styles.uploadArea}>
                {preview ? (
                    <div className={styles.previewContainer}>
                        <img src={preview} alt="Logo" className={styles.preview} />
                        <button type="button" onClick={handleRemove} className={styles.removeBtn}>
                            ✕
                        </button>
                    </div>
                ) : (
                    <div
                        className={styles.dropzone}
                        onClick={() => inputRef.current?.click()}
                    >
                        {uploading ? (
                            <span className={styles.uploading}>Enviando...</span>
                        ) : (
                            <>
                                <span className={styles.icon}>🖼️</span>
                                <span className={styles.text}>Clique para selecionar imagem</span>
                                <span className={styles.hint}>Tamanho recomendado: {recommendedSize}</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && <span className={styles.error}>{error}</span>}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className={styles.fileInput}
            />

            {/* Hidden input to submit the URL with the form - controlled value */}
            <input
                type="hidden"
                name={inputName}
                value={logoUrl}
                readOnly
            />
        </div>
    );
}

