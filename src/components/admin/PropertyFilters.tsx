'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import styles from './PropertyFilters.module.css';

interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

interface PropertyFiltersProps {
    propertyTypes: FilterOption[];
    neighborhoods: FilterOption[];
    currentType?: string;
    currentNeighborhood?: string;
    currentSearch?: string;
}

export default function PropertyFilters({
    propertyTypes,
    neighborhoods,
    currentType = '',
    currentNeighborhood = '',
    currentSearch = '',
}: PropertyFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(currentSearch);

    const updateFilters = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        startTransition(() => {
            router.push(`/dashboard/imoveis?${params.toString()}`);
        });
    }, [router, searchParams]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters('busca', search);
    };

    const clearFilters = () => {
        setSearch('');
        startTransition(() => {
            router.push('/dashboard/imoveis');
        });
    };

    const hasFilters = currentType || currentNeighborhood || currentSearch;

    return (
        <div className={`${styles.filters} ${isPending ? styles.loading : ''}`}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <input
                    type="text"
                    placeholder="Buscar por título, endereço..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                />
                <button type="submit" className={styles.searchBtn}>
                    🔍
                </button>
            </form>

            <div className={styles.selectGroup}>
                <select
                    value={currentType}
                    onChange={(e) => updateFilters('tipo', e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="">Todos os tipos</option>
                    {propertyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label} {type.count !== undefined && `(${type.count})`}
                        </option>
                    ))}
                </select>

                <select
                    value={currentNeighborhood}
                    onChange={(e) => updateFilters('bairro', e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="">Todos os bairros</option>
                    {neighborhoods.map((n) => (
                        <option key={n.value} value={n.value}>
                            {n.label} {n.count !== undefined && `(${n.count})`}
                        </option>
                    ))}
                </select>
            </div>

            {hasFilters && (
                <button type="button" onClick={clearFilters} className={styles.clearBtn}>
                    ✕ Limpar filtros
                </button>
            )}
        </div>
    );
}
