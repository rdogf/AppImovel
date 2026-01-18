import prisma from '@/lib/prisma';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { restoreProperty, permanentDeleteProperty } from '../actions';
import styles from '../page.module.css';

export default async function InactivePropertiesPage() {
    const session = await auth();

    // Only master can see inactive properties
    if (session?.user?.role !== 'master') {
        redirect('/dashboard/imoveis');
    }

    const properties = await prisma.property.findMany({
        where: { active: false },
        orderBy: { updatedAt: 'desc' },
        include: {
            photos: { take: 1, orderBy: { order: 'asc' } },
            user: { select: { name: true } },
        },
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <Link href="/dashboard/imoveis" className={styles.backLink}>
                        ← Voltar para lista
                    </Link>
                    <h1>Imóveis Inativos</h1>
                    <p className={styles.subtitle}>{properties.length} imóvel(is) inativo(s)</p>
                </div>
            </header>

            {properties.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>✅</div>
                    <h3>Nenhum imóvel inativo</h3>
                    <p>Todos os imóveis estão ativos no sistema.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {properties.map((property) => (
                        <div key={property.id} className={`${styles.card} ${styles.inactive}`}>
                            <div className={styles.cardImage}>
                                {property.photos[0] ? (
                                    <img src={property.photos[0].url} alt={property.title} />
                                ) : (
                                    <div className={styles.noImage}>🏠</div>
                                )}
                                <span className={`${styles.statusBadge}`} style={{ background: '#6c757d' }}>
                                    Inativo
                                </span>
                            </div>

                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>{property.title}</h3>
                                <p className={styles.cardAddress}>
                                    {property.neighborhood}, {property.city}
                                </p>
                                {property.user && (
                                    <p className={styles.cardOwner}>👤 {property.user.name}</p>
                                )}

                                <div className={styles.cardPrice}>
                                    {formatCurrency(property.price)}
                                </div>
                            </div>

                            <div className={styles.cardActions}>
                                <form action={restoreProperty.bind(null, property.id)}>
                                    <button type="submit" className="btn btn-primary btn-sm">
                                        Restaurar
                                    </button>
                                </form>
                                <form action={permanentDeleteProperty.bind(null, property.id)}>
                                    <button
                                        type="submit"
                                        className="btn btn-ghost btn-sm"
                                        style={{ color: 'var(--color-danger)' }}
                                    >
                                        Excluir Permanente
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
