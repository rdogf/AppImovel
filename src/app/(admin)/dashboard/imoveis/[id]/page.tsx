import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { updateProperty, deleteProperty, deletePhoto } from '../actions';
import { updatePhotoOrder } from './photo-actions';
import PhotoManager from '@/components/admin/PhotoManager';
import styles from '../novo/page.module.css';
import editStyles from './page.module.css';

interface Props {
    params: Promise<{ id: string }>;
}

async function handleDeletePhoto(id: string, propertyId: string) {
    'use server';
    await deletePhoto(id, propertyId);
}

async function handleUpdateOrder(propertyId: string, photoIds: string[]) {
    'use server';
    await updatePhotoOrder(propertyId, photoIds);
}

export default async function EditarImovelPage({ params }: Props) {
    const { id } = await params;

    const property = await prisma.property.findUnique({
        where: { id },
        include: { photos: { orderBy: { order: 'asc' } } },
    });

    if (!property) {
        notFound();
    }

    const updatePropertyWithId = updateProperty.bind(null, id);
    const deletePhotoAction = async (photoId: string) => {
        'use server';
        await deletePhoto(photoId, id);
    };
    const updateOrderAction = async (photoIds: string[]) => {
        'use server';
        await updatePhotoOrder(id, photoIds);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <Link href="/dashboard/imoveis" className={styles.backLink}>
                        ← Voltar para lista
                    </Link>
                    <h1>Editar Imóvel</h1>
                </div>
                <form action={deleteProperty.bind(null, id)}>
                    <button type="submit" className="btn btn-ghost" style={{ color: 'var(--color-danger)' }}>
                        Excluir
                    </button>
                </form>
            </header>

            <form action={updatePropertyWithId} className={styles.form}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Informações Básicas</h2>

                    <div className={styles.grid2}>
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">Título *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-input"
                                defaultValue={property.title}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="propertyType" className="form-label">Tipo *</label>
                            <select id="propertyType" name="propertyType" className="form-select" defaultValue={property.propertyType} required>
                                <option value="">Selecione...</option>
                                <option value="apartamento">Apartamento</option>
                                <option value="casa">Casa</option>
                                <option value="cobertura">Cobertura</option>
                                <option value="terreno">Terreno</option>
                                <option value="sala_comercial">Sala Comercial</option>
                                <option value="loja">Loja</option>
                                <option value="galpao">Galpão</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="address" className="form-label">Endereço *</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            className="form-input"
                            defaultValue={property.address}
                            required
                        />
                    </div>

                    <div className={styles.grid3}>
                        <div className="form-group">
                            <label htmlFor="neighborhood" className="form-label">Bairro *</label>
                            <input
                                type="text"
                                id="neighborhood"
                                name="neighborhood"
                                className="form-input"
                                defaultValue={property.neighborhood}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="city" className="form-label">Cidade *</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                className="form-input"
                                defaultValue={property.city}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="state" className="form-label">Estado</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                className="form-input"
                                defaultValue={property.state}
                                maxLength={2}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Características</h2>

                    <div className={styles.grid4}>
                        <div className="form-group">
                            <label htmlFor="totalArea" className="form-label">Área Total (m²) *</label>
                            <input
                                type="number"
                                id="totalArea"
                                name="totalArea"
                                className="form-input"
                                defaultValue={property.totalArea}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bedrooms" className="form-label">Quartos</label>
                            <input
                                type="number"
                                id="bedrooms"
                                name="bedrooms"
                                className="form-input"
                                defaultValue={property.bedrooms}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="suites" className="form-label">Suítes</label>
                            <input
                                type="number"
                                id="suites"
                                name="suites"
                                className="form-input"
                                defaultValue={property.suites}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bathrooms" className="form-label">Banheiros</label>
                            <input
                                type="number"
                                id="bathrooms"
                                name="bathrooms"
                                className="form-input"
                                defaultValue={property.bathrooms}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className={styles.grid2}>
                        <div className="form-group">
                            <label htmlFor="parkingSpaces" className="form-label">Vagas de Garagem</label>
                            <input
                                type="number"
                                id="parkingSpaces"
                                name="parkingSpaces"
                                className="form-input"
                                defaultValue={property.parkingSpaces}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="status" className="form-label">Status</label>
                            <select id="status" name="status" className="form-select" defaultValue={property.status}>
                                <option value="disponivel">Disponível</option>
                                <option value="reservado">Reservado</option>
                                <option value="vendido">Vendido</option>
                                <option value="alugado">Alugado</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="characteristics" className="form-label">Descrição / Características</label>
                        <textarea
                            id="characteristics"
                            name="characteristics"
                            className="form-textarea"
                            defaultValue={property.characteristics}
                            rows={4}
                        ></textarea>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Valores</h2>

                    <div className={styles.grid3}>
                        <div className="form-group">
                            <label htmlFor="price" className="form-label">Preço (R$) *</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                className="form-input"
                                defaultValue={property.price}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="condoFee" className="form-label">Condomínio (R$/mês)</label>
                            <input
                                type="number"
                                id="condoFee"
                                name="condoFee"
                                className="form-input"
                                defaultValue={property.condoFee ?? ''}
                                step="0.01"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="iptu" className="form-label">IPTU (R$/ano)</label>
                            <input
                                type="number"
                                id="iptu"
                                name="iptu"
                                className="form-input"
                                defaultValue={property.iptu ?? ''}
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className={styles.checkboxLabel}>
                            <input type="checkbox" name="featured" defaultChecked={property.featured} />
                            <span>Destacar este imóvel</span>
                        </label>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link href="/dashboard/imoveis" className="btn btn-ghost">
                        Cancelar
                    </Link>
                    <button type="submit" className="btn btn-secondary">
                        Salvar Alterações
                    </button>
                </div>
            </form>

            {/* Photos Section */}
            <div className={`${styles.section} ${editStyles.photosSection}`}>
                <h2 className={styles.sectionTitle}>📸 Fotos do Imóvel</h2>
                <PhotoManager
                    propertyId={id}
                    photos={property.photos}
                    onDeletePhoto={deletePhotoAction}
                    onUpdateOrder={updateOrderAction}
                />
            </div>

            {/* Share Section */}
            <div className={`${styles.section} ${editStyles.shareSection}`}>
                <h2 className={styles.sectionTitle}>Compartilhar</h2>
                <p className={editStyles.shareText}>
                    Link público para compartilhamento:
                </p>
                <div className={editStyles.shareLink}>
                    <code>/imovel/{property.shareCode}</code>
                    <Link href={`/imovel/${property.shareCode}`} className="btn btn-outline btn-sm" target="_blank">
                        Abrir
                    </Link>
                </div>
            </div>
        </div>
    );
}
