'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PhotoManager.module.css';

interface Photo {
    id: string;
    url: string;
    caption: string | null;
    order: number;
}

interface PhotoManagerProps {
    propertyId: string;
    photos: Photo[];
    onDeletePhoto: (id: string) => Promise<void>;
    onUpdateOrder: (photoIds: string[]) => Promise<void>;
}

export default function PhotoManager({ propertyId, photos: initialPhotos, onDeletePhoto, onUpdateOrder }: PhotoManagerProps) {
    const router = useRouter();
    const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
    const [uploading, setUploading] = useState(false);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);

        const formData = new FormData();
        formData.append('propertyId', propertyId);

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();

            if (result.photos) {
                setPhotos((prev) => [...prev, ...result.photos]);
            }

            router.refresh();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erro ao fazer upload das imagens');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [propertyId, router]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        handleFileSelect(e.dataTransfer.files);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta foto?')) return;

        await onDeletePhoto(id);
        setPhotos((prev) => prev.filter((p) => p.id !== id));
    };

    // Drag and drop reordering
    const handlePhotoDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handlePhotoDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        if (draggedId && draggedId !== id) {
            setDragOverId(id);
        }
    };

    const handlePhotoDragEnd = async () => {
        if (draggedId && dragOverId && draggedId !== dragOverId) {
            const newPhotos = [...photos];
            const draggedIndex = newPhotos.findIndex((p) => p.id === draggedId);
            const dropIndex = newPhotos.findIndex((p) => p.id === dragOverId);

            const [draggedPhoto] = newPhotos.splice(draggedIndex, 1);
            newPhotos.splice(dropIndex, 0, draggedPhoto);

            setPhotos(newPhotos);

            // Update order in database
            const photoIds = newPhotos.map((p) => p.id);
            await onUpdateOrder(photoIds);
        }

        setDraggedId(null);
        setDragOverId(null);
    };

    return (
        <div className={styles.container}>
            {/* Upload Area */}
            <div
                className={`${styles.uploadArea} ${uploading ? styles.uploading : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className={styles.fileInput}
                />
                {uploading ? (
                    <div className={styles.uploadingContent}>
                        <div className="spinner"></div>
                        <span>Enviando imagens...</span>
                    </div>
                ) : (
                    <div className={styles.uploadContent}>
                        <span className={styles.uploadIcon}>📸</span>
                        <span className={styles.uploadText}>
                            Arraste imagens aqui ou clique para selecionar
                        </span>
                        <span className={styles.uploadHint}>
                            Suporta múltiplas imagens (JPG, PNG, WebP)
                        </span>
                    </div>
                )}
            </div>

            {/* Photos Grid */}
            {photos.length === 0 ? (
                <p className={styles.noPhotos}>Nenhuma foto adicionada ainda</p>
            ) : (
                <>
                    <p className={styles.reorderHint}>
                        💡 Arraste as fotos para reorganizar. A primeira foto será a capa.
                    </p>
                    <div className={styles.photosGrid}>
                        {photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className={`${styles.photoCard} ${draggedId === photo.id ? styles.dragging : ''} ${dragOverId === photo.id ? styles.dragOver : ''}`}
                                draggable
                                onDragStart={(e) => handlePhotoDragStart(e, photo.id)}
                                onDragOver={(e) => handlePhotoDragOver(e, photo.id)}
                                onDragEnd={handlePhotoDragEnd}
                            >
                                {index === 0 && <span className={styles.coverBadge}>Capa</span>}
                                <img src={photo.url} alt={photo.caption || 'Foto do imóvel'} />
                                <div className={styles.photoActions}>
                                    <span className={styles.orderNumber}>{index + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(photo.id)}
                                        className={styles.deleteBtn}
                                        title="Excluir foto"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
