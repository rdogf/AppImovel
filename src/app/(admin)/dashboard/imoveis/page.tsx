import prisma from '@/lib/prisma';
import Link from 'next/link';
import { formatCurrency, getPropertyTypeLabel } from '@/lib/utils';
import { auth } from '@/lib/auth';
import PropertyFilters from '@/components/admin/PropertyFilters';
import PropertyPdfButton from '@/components/admin/PropertyPdfButton';
import styles from './page.module.css';

interface Props {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ImoveisPage({ searchParams }: Props) {
    const session = await auth();
    const params = await searchParams;

    const currentType = params.tipo || '';
    const currentNeighborhood = params.bairro || '';
    const currentSearch = params.busca || '';

    // Build base filter for user
    const userRole = session?.user?.role;
    const userId = session?.user?.id;

    let userFilter: any = {};
    if (userRole === 'admin') {
        userFilter = {
            OR: [
                { userId },
                { user: { parentId: userId } }
            ]
        };
    } else if (userRole === 'user') {
        userFilter = { userId };
    }

    const baseFilter = { active: true, ...userFilter };

    // Build search filter
    const searchFilter = currentSearch ? {
        OR: [
            { title: { contains: currentSearch } },
            { address: { contains: currentSearch } },
            { neighborhood: { contains: currentSearch } },
            { city: { contains: currentSearch } },
        ],
    } : {};

    // Build type filter
    const typeFilter = currentType ? { propertyType: currentType } : {};

    // Build neighborhood filter
    const neighborhoodFilter = currentNeighborhood ? { neighborhood: currentNeighborhood } : {};

    // Combined filter
    const whereClause = {
        ...baseFilter,
        ...searchFilter,
        ...typeFilter,
        ...neighborhoodFilter,
    };

    // Get properties with ALL photos for PDF
    const properties = await prisma.property.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
            photos: { orderBy: { order: 'asc' } },
            user: { select: { name: true } },
        },
    });

    // Get user settings for PDF generation
    const userIdForSettings = session?.user?.role === 'user' ? (session?.user?.parentId || session?.user?.id) : session?.user?.id;
    const userSettings = userIdForSettings ? await prisma.userSettings.findUnique({
        where: { userId: userIdForSettings }
    }) : null;

    const pdfSettings = {
        companyName: userSettings?.companyName || 'Imobiliária',
        logoUrl: userSettings?.logoUrl || null,
        primaryColor: userSettings?.primaryColor || '#1a1a2e',
        whatsappNumber: userSettings?.whatsappNumber || null,
        email: userSettings?.email || null,
    };

    // Get filter options (from all user's properties)
    const allProperties = await prisma.property.findMany({
        where: baseFilter,
        select: { propertyType: true, neighborhood: true },
    });

    // Count by type
    const typeCounts = allProperties.reduce((acc, p) => {
        acc[p.propertyType] = (acc[p.propertyType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const propertyTypes = Object.entries(typeCounts).map(([value, count]) => ({
        value,
        label: getPropertyTypeLabel(value),
        count,
    })).sort((a, b) => a.label.localeCompare(b.label));

    // Count by neighborhood
    const neighborhoodCounts = allProperties.reduce((acc, p) => {
        acc[p.neighborhood] = (acc[p.neighborhood] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const neighborhoods = Object.entries(neighborhoodCounts).map(([value, count]) => ({
        value,
        label: value,
        count,
    })).sort((a, b) => a.label.localeCompare(b.label));

    const isMaster = session?.user?.role === 'master';

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Imóveis</h1>
                    <p className={styles.subtitle}>
                        {properties.length} imóvel(is) encontrado(s)
                    </p>
                </div>
                <div className={styles.headerActions}>
                    {isMaster && (
                        <Link href="/dashboard/imoveis/inativos" className="btn btn-ghost">
                            Ver Inativos
                        </Link>
                    )}
                    <Link href="/dashboard/imoveis/novo" className="btn btn-secondary">
                        + Novo Imóvel
                    </Link>
                </div>
            </header>

            <PropertyFilters
                propertyTypes={propertyTypes}
                neighborhoods={neighborhoods}
                currentType={currentType}
                currentNeighborhood={currentNeighborhood}
                currentSearch={currentSearch}
            />

            {properties.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <h3>Nenhum imóvel encontrado</h3>
                    <p>Tente ajustar os filtros ou adicione um novo imóvel.</p>
                    <Link href="/dashboard/imoveis/novo" className="btn btn-primary">
                        Adicionar Imóvel
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {properties.map((property) => (
                        <div key={property.id} className={styles.card}>
                            <div className={styles.cardImage}>
                                {property.photos[0] ? (
                                    <img src={property.photos[0].url} alt={property.title} />
                                ) : (
                                    <div className={styles.noImage}>🏠</div>
                                )}
                                <span className={`${styles.statusBadge} status-${property.status}`}>
                                    {property.status === 'disponivel' && 'Disponível'}
                                    {property.status === 'vendido' && 'Vendido'}
                                    {property.status === 'reservado' && 'Reservado'}
                                    {property.status === 'alugado' && 'Alugado'}
                                </span>
                            </div>

                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>{property.title}</h3>
                                <p className={styles.cardAddress}>
                                    {property.neighborhood}, {property.city}
                                </p>
                                {(userRole === 'master' || userRole === 'admin') && property.user && (
                                    <p className={styles.cardOwner}>👤 {property.user.name}</p>
                                )}

                                <div className={styles.cardDetails}>
                                    <span>{property.totalArea}m²</span>
                                    <span>{property.bedrooms} quarto(s)</span>
                                    <span>{property.parkingSpaces} vaga(s)</span>
                                </div>

                                <div className={styles.cardPrice}>
                                    {formatCurrency(property.price)}
                                </div>
                            </div>

                            <div className={styles.cardActions}>
                                <Link
                                    href={`/dashboard/imoveis/${property.id}`}
                                    className="btn btn-outline btn-sm"
                                >
                                    Editar
                                </Link>
                                {isMaster && property.userId !== session?.user?.id && (
                                    <form action={async () => {
                                        'use server';
                                        const { deleteProperty } = await import('./actions');
                                        await deleteProperty(property.id);
                                    }}>
                                        <button type="submit" className="btn btn-danger btn-sm">
                                            Desativar
                                        </button>
                                    </form>
                                )}
                                <Link
                                    href={`/imovel/${property.shareCode}`}
                                    className="btn btn-ghost btn-sm"
                                    target="_blank"
                                >
                                    Ver Público
                                </Link>
                                <PropertyPdfButton
                                    property={{
                                        id: property.id,
                                        title: property.title,
                                        address: property.address,
                                        neighborhood: property.neighborhood,
                                        city: property.city,
                                        state: property.state,
                                        totalArea: property.totalArea,
                                        propertyType: property.propertyType,
                                        bedrooms: property.bedrooms,
                                        suites: property.suites,
                                        bathrooms: property.bathrooms,
                                        parkingSpaces: property.parkingSpaces,
                                        characteristics: property.characteristics,
                                        price: property.price,
                                        condoFee: property.condoFee,
                                        iptu: property.iptu,
                                        status: property.status,
                                        photos: property.photos.map(p => ({ url: p.url })),
                                    }}
                                    settings={pdfSettings}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
