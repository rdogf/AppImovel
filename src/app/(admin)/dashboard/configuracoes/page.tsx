import { auth } from '@/lib/auth';
import { getGlobalSettings, updateGlobalSettings, getUserSettings, updateUserSettings } from './actions';
import LogoUploader from '@/components/admin/LogoUploader';
import styles from './page.module.css';

export default async function ConfiguracoesPage() {
    const session = await auth();
    const isMaster = session?.user?.role === 'master';
    const globalSettings = await getGlobalSettings();
    const userSettings = await getUserSettings();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Configurações</h1>
                <p className={styles.subtitle}>Personalize sua página e seus imóveis</p>
            </header>

            {/* Global App Settings - Master Only */}
            {isMaster && (
                <form action={updateGlobalSettings} className={styles.form}>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>🌐 Configurações do App <span className={styles.masterBadge}>Admin Master</span></h2>
                        <p className={styles.sectionDescription}>Essas configurações afetam a identidade do aplicativo para todos os usuários.</p>

                        <div className="form-group">
                            <label htmlFor="appName" className="form-label">Nome do App</label>
                            <input
                                type="text"
                                id="appName"
                                name="appName"
                                className="form-input"
                                defaultValue={globalSettings.appName}
                                required
                            />
                            <small className={styles.hint}>Aparece na sidebar para todos os usuários</small>
                        </div>

                        <LogoUploader
                            currentLogo={globalSettings.appLogo}
                            inputName="appLogo"
                            label="Logo do App"
                            recommendedSize="200x50px (PNG transparente)"
                        />

                        <div className={styles.actions}>
                            <button type="submit" className="btn btn-primary">
                                Salvar Config. do App
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* User Settings - All Users */}
            <form action={updateUserSettings} className={styles.form}>
                {/* Branding Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>🎨 Sua Identidade Visual</h2>
                    <p className={styles.sectionDescription}>Essas configurações aparecem nas páginas públicas dos seus imóveis.</p>

                    <div className="form-group">
                        <label htmlFor="companyName" className="form-label">Nome da Sua Empresa/Marca</label>
                        <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            className="form-input"
                            defaultValue={userSettings?.companyName || ''}
                            required
                        />
                    </div>

                    <LogoUploader
                        currentLogo={userSettings?.logoUrl || null}
                        inputName="logoUrl"
                        label="Seu Logo"
                        recommendedSize="300x80px (PNG transparente)"
                    />

                    <div className={styles.colorsGrid}>
                        <div className="form-group">
                            <label htmlFor="primaryColor" className="form-label">Cor Primária</label>
                            <div className={styles.colorInput}>
                                <input
                                    type="color"
                                    id="primaryColor"
                                    name="primaryColor"
                                    defaultValue={userSettings?.primaryColor || '#1a1a2e'}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    defaultValue={userSettings?.primaryColor || '#1a1a2e'}
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
                                    defaultValue={userSettings?.secondaryColor || '#e94560'}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    defaultValue={userSettings?.secondaryColor || '#e94560'}
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
                                    defaultValue={userSettings?.accentColor || '#f5a623'}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    defaultValue={userSettings?.accentColor || '#f5a623'}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>📝 Seção Sobre</h2>

                    <div className="form-group">
                        <label htmlFor="aboutTitle" className="form-label">Título</label>
                        <input
                            type="text"
                            id="aboutTitle"
                            name="aboutTitle"
                            className="form-input"
                            defaultValue={userSettings?.aboutTitle || ''}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="aboutText" className="form-label">Texto</label>
                        <textarea
                            id="aboutText"
                            name="aboutText"
                            className="form-textarea"
                            defaultValue={userSettings?.aboutText || ''}
                            rows={4}
                        ></textarea>
                    </div>
                </div>

                {/* Contact Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>📞 Seus Dados de Contato</h2>

                    <div className={styles.grid2}>
                        <div className="form-group">
                            <label htmlFor="whatsappNumber" className="form-label">WhatsApp (com DDD)</label>
                            <input
                                type="tel"
                                id="whatsappNumber"
                                name="whatsappNumber"
                                className="form-input"
                                defaultValue={userSettings?.whatsappNumber ?? ''}
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
                                defaultValue={userSettings?.email ?? ''}
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
                            defaultValue={userSettings?.address ?? ''}
                            placeholder="Rua Exemplo, 123 - Centro, Rio de Janeiro/RJ"
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="submit" className="btn btn-secondary btn-lg">
                        Salvar Minhas Configurações
                    </button>
                </div>
            </form>
        </div>
    );
}
