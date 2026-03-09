import prisma from '@/lib/prisma';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import styles from './page.module.css';

export default async function DashboardPage() {
    const session = await auth();
    const isMaster = session?.user?.role === 'master';

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

    // Get statistics (filtered by user for non-master)
    const [statsAgg, totalProperties, availableProperties, soldProperties, reservedProperties] = await Promise.all([
        prisma.property.aggregate({
            _sum: {
                visitCount: true,
                pdfGeneratedCount: true
            },
            where: { active: true, ...userFilter }
        }),
        prisma.property.count({ where: { active: true, ...userFilter } }),
        prisma.property.count({ where: { status: 'disponivel', active: true, ...userFilter } }),
        prisma.property.count({ where: { status: 'vendido', active: true, ...userFilter } }),
        prisma.property.count({ where: { status: 'reservado', active: true, ...userFilter } }),
    ]);

    const totalVisits = statsAgg._sum.visitCount || 0;
    const totalPdfs = statsAgg._sum.pdfGeneratedCount || 0;

    // Get recent properties (filtered by user for non-master)
    const recentProperties = await prisma.property.findMany({
        where: { active: true, ...userFilter },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            photos: { take: 1, orderBy: { order: 'asc' } },
        },
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Dashboard</h1>
                <Link href="/dashboard/imoveis/novo" className="btn btn-secondary">
                    + Novo Imóvel
                </Link>
            </header>

            <section className={styles.stats}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🏠</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{totalProperties}</span>
                        <span className={styles.statLabel}>Total de Imóveis</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(23, 162, 184, 0.15)' }}>👁️</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue} style={{ color: '#17a2b8' }}>{totalVisits}</span>
                        <span className={styles.statLabel}>Visualizações</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(108, 117, 125, 0.15)' }}>📄</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue} style={{ color: '#6c757d' }}>{totalPdfs}</span>
                        <span className={styles.statLabel}>PDFs Gerados</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(40, 167, 69, 0.15)' }}>✓</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue} style={{ color: 'var(--color-success)' }}>{availableProperties}</span>
                        <span className={styles.statLabel}>Disponíveis</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(220, 53, 69, 0.15)' }}>🔒</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue} style={{ color: 'var(--color-danger)' }}>{soldProperties}</span>
                        <span className={styles.statLabel}>Vendidos</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(255, 193, 7, 0.15)' }}>⏳</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue} style={{ color: '#856404' }}>{reservedProperties}</span>
                        <span className={styles.statLabel}>Reservados</span>
                    </div>
                </div>
            </section>

            <section className={styles.recentSection}>
                <div className={styles.sectionHeader}>
                    <h2>Imóveis Recentes</h2>
                    <Link href="/dashboard/imoveis" className={styles.viewAllLink}>
                        Ver todos →
                    </Link>
                </div>

                {recentProperties.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🏠</div>
                        <h3>Nenhum imóvel cadastrado</h3>
                        <p>Comece adicionando seu primeiro imóvel.</p>
                        <Link href="/dashboard/imoveis/novo" className="btn btn-primary">
                            Adicionar Imóvel
                        </Link>
                    </div>
                ) : (
                    <div className={styles.propertiesList}>
                        {recentProperties.map((property) => (
                            <Link
                                key={property.id}
                                href={`/dashboard/imoveis/${property.id}`}
                                className={styles.propertyCard}
                            >
                                <div className={styles.propertyImage}>
                                    {property.photos[0] ? (
                                        <img src={property.photos[0].url} alt={property.title} />
                                    ) : (
                                        <div className={styles.noImage}>🏠</div>
                                    )}
                                </div>
                                <div className={styles.propertyInfo}>
                                    <h3>{property.title}</h3>
                                    <p className={styles.propertyAddress}>
                                        {property.neighborhood}, {property.city}
                                    </p>
                                    <div className={styles.propertyMeta}>
                                        <span className={`badge status-${property.status}`}>
                                            {property.status === 'disponivel' && 'Disponível'}
                                            {property.status === 'vendido' && 'Vendido'}
                                            {property.status === 'reservado' && 'Reservado'}
                                            {property.status === 'alugado' && 'Alugado'}
                                        </span>
                                        <span className={styles.propertyPrice}>
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            }).format(property.price)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
