'use client';

import Link from 'next/link';
import { createProperty, getProperty } from '../actions';
import styles from './page.module.css';
import { useState } from 'react';
import ClonePropertySelect from '@/components/admin/ClonePropertySelect';

interface PropertySummary {
    id: string;
    title: string;
}

interface NewPropertyFormProps {
    properties: PropertySummary[];
}

export default function NewPropertyForm({ properties }: NewPropertyFormProps) {
    // We use a key to force re-render when cloning data, populating the form
    const [formKey, setFormKey] = useState(0);
    const [formData, setFormData] = useState<any>({});

    const handleClone = async (id: string) => {
        if (!id) return;

        try {
            const property = await getProperty(id);
            if (property) {
                // Remove ID, photos, user, timestamps etc.
                const { id, userId, createdAt, updatedAt, photos, ...cloneData } = property;

                // Explicitly set status to default "disponivel" unless we want to copy status too
                const dataToUse = {
                    ...cloneData,
                    title: `${cloneData.title} (Cópia)`, // Optional: append copy
                    status: 'disponivel'
                };

                setFormData(dataToUse);
                setFormKey(prev => prev + 1); // Remount form with new defaults
            }
        } catch (error) {
            console.error("Error cloning property", error);
            alert("Erro ao importar dados do imóvel.");
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <Link href="/dashboard/imoveis" className={styles.backLink}>
                        ← Voltar para lista
                    </Link>
                    <h1>Novo Imóvel</h1>
                </div>
            </header>

            <ClonePropertySelect properties={properties} onSelect={handleClone} />

            <form key={formKey} action={createProperty} className={styles.form}>
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
                                placeholder="Ex: Apartamento Vista Mar"
                                defaultValue={formData.title}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="propertyType" className="form-label">Tipo *</label>
                            <select id="propertyType" name="propertyType" className="form-select" defaultValue={formData.propertyType} required>
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
                            placeholder="Ex: Av. Ermanno Dallari, 363"
                            defaultValue={formData.address}
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
                                placeholder="Ex: Barra da Tijuca"
                                defaultValue={formData.neighborhood}
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
                                placeholder="Ex: Rio de Janeiro"
                                defaultValue={formData.city}
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
                                placeholder="RJ"
                                defaultValue={formData.state || "RJ"}
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
                                placeholder="555.81"
                                step="0.01"
                                min="0"
                                defaultValue={formData.totalArea}
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
                                placeholder="3"
                                min="0"
                                defaultValue={formData.bedrooms || 0}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="suites" className="form-label">Suítes</label>
                            <input
                                type="number"
                                id="suites"
                                name="suites"
                                className="form-input"
                                placeholder="2"
                                min="0"
                                defaultValue={formData.suites || 0}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bathrooms" className="form-label">Banheiros</label>
                            <input
                                type="number"
                                id="bathrooms"
                                name="bathrooms"
                                className="form-input"
                                placeholder="4"
                                min="0"
                                defaultValue={formData.bathrooms || 0}
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
                                placeholder="2"
                                min="0"
                                defaultValue={formData.parkingSpaces || 0}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="status" className="form-label">Status</label>
                            <select id="status" name="status" className="form-select" defaultValue={formData.status || "disponivel"}>
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
                            placeholder="Descreva as características do imóvel..."
                            rows={4}
                            defaultValue={formData.characteristics}
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
                                placeholder="16900000.00"
                                step="0.01"
                                min="0"
                                defaultValue={formData.price}
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
                                placeholder="1200.00"
                                step="0.01"
                                min="0"
                                defaultValue={formData.condoFee}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="iptu" className="form-label">IPTU (R$/ano)</label>
                            <input
                                type="number"
                                id="iptu"
                                name="iptu"
                                className="form-input"
                                placeholder="29000.00"
                                step="0.01"
                                min="0"
                                defaultValue={formData.iptu}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className={styles.checkboxLabel}>
                            <input type="checkbox" name="featured" defaultChecked={formData.featured} />
                            <span>Destacar este imóvel</span>
                        </label>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link href="/dashboard/imoveis" className="btn btn-ghost">
                        Cancelar
                    </Link>
                    <button type="submit" className="btn btn-secondary">
                        Salvar Imóvel
                    </button>
                </div>
            </form>
        </div>
    );
}
