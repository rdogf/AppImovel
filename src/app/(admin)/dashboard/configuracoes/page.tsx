import { auth } from '@/lib/auth';
import { getSettings, updateSettings } from './actions';
import styles from './page.module.css';

export default async function ConfiguracoesPage() {
    const session = await auth();
    const settings = await getSettings();
    const isMaster = session?.user?.role === 'master';

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Configurações</h1>
                <p className={styles.subtitle}>
                    {isMaster ? 'Configure a identidade visual e dados de contato' : 'Configure seus dados de contato'}
                </p>
            </header>

            <form action={updateSettings} className={styles.form}>
                {/* Branding Section - Master Only */}
                {isMaster && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>🎨 Identidade Visual <span className={styles.masterBadge}>Admin Master</span></h2>

                        <div className="form-group">
                            <label htmlFor="companyName" className="form-label">Nome da Empresa</label>
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                className="form-input"
                                defaultValue={settings.companyName}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="logoUrl" className="form-label">URL do Logo</label>
                            <input
                                type="url"
                                id="logoUrl"
                                name="logoUrl"
                                className="form-input"
                                defaultValue={settings.logoUrl ?? ''}
                                placeholder="https://exemplo.com/logo.png"
                            />
                            {settings.logoUrl && (
                                <div className={styles.logoPreview}>
                                    <img src={settings.logoUrl} alt="Logo" />
                                </div>
                            )}
                        </div>

                        <div className={styles.colorsGrid}>
                            <div className="form-group">
                                <label htmlFor="primaryColor" className="form-label">Cor Primária</label>
                                <div className={styles.colorInput}>
                                    <input
                                        type="color"
                                        id="primaryColor"
                                        name="primaryColor"
                                        defaultValue={settings.primaryColor}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        defaultValue={settings.primaryColor}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="secondaryColor" className="form-label">Cor Secundária</label>
                                <div className={styles.colorInput}>
                                    <input
                                        type="color"
                                        id="secondaryColor"
                                        name="secondaryColor"
                                        defaultValue={settings.secondaryColor}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        defaultValue={settings.secondaryColor}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="accentColor" className="form-label">Cor de Destaque</label>
                                <div className={styles.colorInput}>
                                    <input
                                        type="color"
                                        id="accentColor"
                                        name="accentColor"
                                        defaultValue={settings.accentColor}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        defaultValue={settings.accentColor}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* About Section - Master Only */}
                {isMaster && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>📝 Seção Sobre</h2>

                        <div className="form-group">
                            <label htmlFor="aboutTitle" className="form-label">Título</label>
                            <input
                                type="text"
                                id="aboutTitle"
                                name="aboutTitle"
                                className="form-input"
                                defaultValue={settings.aboutTitle}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="aboutText" className="form-label">Texto</label>
                            <textarea
                                id="aboutText"
                                name="aboutText"
                                className="form-textarea"
                                defaultValue={settings.aboutText}
                                rows={4}
                            ></textarea>
                        </div>
                    </div>
                )}

                {/* Contact Section - Master Only */}
                {isMaster && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>📞 Contato Geral</h2>

                        <div className={styles.grid2}>
                            <div className="form-group">
                                <label htmlFor="whatsappNumber" className="form-label">WhatsApp (com DDD)</label>
                                <input
                                    type="tel"
                                    id="whatsappNumber"
                                    name="whatsappNumber"
                                    className="form-input"
                                    defaultValue={settings.whatsappNumber ?? ''}
                                    placeholder="5521999999999"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email" className="form-label">E-mail</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-input"
                                    defaultValue={settings.email ?? ''}
                                    placeholder="contato@imobiliaria.com"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="address" className="form-label">Endereço</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                className="form-input"
                                defaultValue={settings.address ?? ''}
                                placeholder="Rua Exemplo, 123 - Centro, Rio de Janeiro/RJ"
                            />
                        </div>
                    </div>
                )}

                {/* Non-master users see only a message */}
                {!isMaster && (
                    <div className={styles.section}>
                        <div className={styles.infoBox}>
                            <h3>ℹ️ Configurações Gerais</h3>
                            <p>As configurações de identidade visual e contato são gerenciadas pelo administrador master.</p>
                            <p>Caso precise alterar algo, entre em contato com o administrador do sistema.</p>
                        </div>
                    </div>
                )}

                {isMaster && (
                    <div className={styles.actions}>
                        <button type="submit" className="btn btn-secondary btn-lg">
                            Salvar Configurações
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
