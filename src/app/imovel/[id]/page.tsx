import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatCurrency, formatArea, getPropertyTypeLabel } from '@/lib/utils';
import ShareButtons from '@/components/public/ShareButtons';
import ImageGallery from '@/components/public/ImageGallery';
import styles from './page.module.css';

interface Props {
    params: Promise<{ id: string }>;
}

// Get property owner's settings
async function getOwnerSettings(userId: string | null) {
    const defaultSettings = {
        primaryColor: '#1a1a2e',
        secondaryColor: '#e94560',
        accentColor: '#f5a623',
        companyName: 'Imobiliária',
        logoUrl: null,
        whatsappNumber: null,
        email: null,
        aboutTitle: 'Sobre Nós',
        aboutText: 'Somos uma imobiliária especializada em imóveis de alto padrão.',
        address: null,
    };

    if (!userId) {
        return defaultSettings;
    }

    const userSettings = await prisma.userSettings.findUnique({
        where: { userId }
    });

    if (userSettings) {
        return userSettings;
    }

    return defaultSettings;
}

export default async function PublicPropertyPage({ params }: Props) {
    const { id } = await params;

    const property = await prisma.property.findFirst({
        where: { shareCode: id },
        include: { photos: { orderBy: { order: 'asc' } } },
    });

    if (!property) {
        notFound();
    }

    // Get the property owner's settings
    const settings = await getOwnerSettings(property.userId);

    // Generate share URLs
    const propertyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/imovel/${property.shareCode}`;
    const shareMessage = `Confira este imóvel: ${property.title} - ${formatCurrency(property.price)} - ${propertyUrl}`;

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header} style={{ '--primary': settings.primaryColor } as React.CSSProperties}>
                <div className={styles.headerContent}>
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt={settings.companyName} className={styles.logo} />
                    ) : (
                        <h1 className={styles.companyName}>{settings.companyName}</h1>
                    )}
                </div>
            </header>

            {/* Hero / Main Photo */}
            {property.photos.length > 0 && (
                <section className={styles.hero}>
                    <img src={property.photos[0].url} alt={property.title} className={styles.heroImage} />
                    <div className={styles.heroOverlay}>
                        <span className={`badge status-${property.status}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                            {property.status === 'disponivel' && 'Disponível'}
                            {property.status === 'vendido' && 'Vendido'}
                            {property.status === 'reservado' && 'Reservado'}
                            {property.status === 'alugado' && 'Alugado'}
                        </span>
                    </div>
                </section>
            )}

            <main className={styles.main}>
                {/* Property Info Card */}
                <section className={styles.infoCard}>
                    <div className={styles.infoHeader}>
                        <div>
                            <span className={styles.propertyType}>{getPropertyTypeLabel(property.propertyType)}</span>
                            <h1 className={styles.propertyTitle}>{property.title}</h1>
                            <p className={styles.propertyAddress}>
                                📍 {property.address} - {property.neighborhood}, {property.city}/{property.state}
                            </p>
                        </div>
                        <div className={styles.priceBox} style={{ '--accent': settings.accentColor } as React.CSSProperties}>
                            <span className={styles.priceLabel}>Valor</span>
                            <span className={styles.price}>{formatCurrency(property.price)}</span>
                            {(property.condoFee || property.iptu) && (
                                <div className={styles.fees}>
                                    {property.condoFee && <span>Condomínio: {formatCurrency(property.condoFee)}/mês</span>}
                                    {property.iptu && <span>IPTU: {formatCurrency(property.iptu)}/ano</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>📐</span>
                            <span className={styles.featureValue}>{formatArea(property.totalArea)}</span>
                            <span className={styles.featureLabel}>Área Total</span>
                        </div>
                        {property.bedrooms > 0 && (
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>🛏️</span>
                                <span className={styles.featureValue}>{property.bedrooms}</span>
                                <span className={styles.featureLabel}>Quarto{property.bedrooms > 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {property.suites > 0 && (
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>🛁</span>
                                <span className={styles.featureValue}>{property.suites}</span>
                                <span className={styles.featureLabel}>Suíte{property.suites > 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {property.bathrooms > 0 && (
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>🚿</span>
                                <span className={styles.featureValue}>{property.bathrooms}</span>
                                <span className={styles.featureLabel}>Banheiro{property.bathrooms > 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {property.parkingSpaces > 0 && (
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>🚗</span>
                                <span className={styles.featureValue}>{property.parkingSpaces}</span>
                                <span className={styles.featureLabel}>Vaga{property.parkingSpaces > 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Description */}
                {property.characteristics && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Características</h2>
                        <p className={styles.description}>{property.characteristics}</p>
                    </section>
                )}

                {/* Photo Gallery */}
                {property.photos.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>📸 Fotos ({property.photos.length})</h2>
                        <ImageGallery photos={property.photos} propertyTitle={property.title} />
                    </section>
                )}

                {/* Share Section */}
                <section className={styles.shareSection} style={{ '--secondary': settings.secondaryColor } as React.CSSProperties}>
                    <h2 className={styles.sectionTitle}>Compartilhar</h2>
                    <p className={styles.shareText}>Gostou deste imóvel? Compartilhe com amigos e familiares!</p>
                    <ShareButtons
                        propertyUrl={propertyUrl}
                        shareMessage={shareMessage}
                        whatsappNumber={settings.whatsappNumber}
                    />
                </section>

                {/* About Section */}
                <section className={styles.aboutSection}>
                    <h2 className={styles.sectionTitle}>{settings.aboutTitle}</h2>
                    <p>{settings.aboutText}</p>
                    {(settings.email || settings.whatsappNumber || settings.address) && (
                        <div className={styles.contactInfo}>
                            {settings.email && (
                                <a href={`mailto:${settings.email}`} className={styles.contactItem}>
                                    ✉️ {settings.email}
                                </a>
                            )}
                            {settings.whatsappNumber && (
                                <a href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`} className={styles.contactItem} target="_blank" rel="noopener noreferrer">
                                    📱 {settings.whatsappNumber}
                                </a>
                            )}
                            {settings.address && (
                                <span className={styles.contactItem}>
                                    📍 {settings.address}
                                </span>
                            )}
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className={styles.footer} style={{ '--primary': settings.primaryColor } as React.CSSProperties}>
                <p>&copy; {new Date().getFullYear()} {settings.companyName}. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}
