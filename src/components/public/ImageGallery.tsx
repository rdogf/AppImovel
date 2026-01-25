'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './ImageGallery.module.css';

interface Photo {
    id: string;
    url: string;
    caption: string | null;
}

interface ImageGalleryProps {
    photos: Photo[];
    propertyTitle: string;
}

export default function ImageGallery({ photos, propertyTitle }: ImageGalleryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setIsOpen(false);
        document.body.style.overflow = '';
    };

    const goNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, [photos.length]);

    const goPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }, [photos.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, goNext, goPrev]);

    // Touch Swipe Logic
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goNext();
        }
        if (isRightSwipe) {
            goPrev();
        }
    };

    if (photos.length === 0) return null;

    return (
        <>
            {/* Thumbnail Grid */}
            <div className={styles.grid}>
                {photos.map((photo, index) => (
                    <button
                        key={photo.id}
                        className={styles.thumbnail}
                        onClick={() => openLightbox(index)}
                        aria-label={`Ver foto ${index + 1}`}
                    >
                        <img src={photo.url} alt={photo.caption || `Foto ${index + 1}`} />
                        <div className={styles.overlay}>
                            <span className={styles.zoomIcon}>🔍</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {isOpen && (
                <div
                    className={styles.lightbox}
                    onClick={closeLightbox}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <button className={styles.closeBtn} onClick={closeLightbox} aria-label="Fechar">
                        ✕
                    </button>

                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        {/* Navigation */}
                        {photos.length > 1 && (
                            <>
                                <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={goPrev} aria-label="Anterior">
                                    ‹
                                </button>
                                <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={goNext} aria-label="Próxima">
                                    ›
                                </button>
                            </>
                        )}

                        {/* Main Image */}
                        <div className={styles.imageContainer}>
                            <img
                                src={photos[currentIndex].url}
                                alt={photos[currentIndex].caption || `${propertyTitle} - Foto ${currentIndex + 1}`}
                            />
                        </div>

                        {/* Caption & Counter */}
                        <div className={styles.footer}>
                            {photos[currentIndex].caption && (
                                <p className={styles.caption}>{photos[currentIndex].caption}</p>
                            )}
                            <span className={styles.counter}>
                                {currentIndex + 1} / {photos.length}
                            </span>
                        </div>

                        {/* Thumbnails Strip */}
                        {photos.length > 1 && (
                            <div className={styles.thumbnailStrip}>
                                {photos.map((photo, index) => (
                                    <button
                                        key={photo.id}
                                        className={`${styles.stripThumb} ${index === currentIndex ? styles.active : ''}`}
                                        onClick={() => setCurrentIndex(index)}
                                    >
                                        <img src={photo.url} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
