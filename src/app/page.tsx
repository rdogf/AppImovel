import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>
                        <span className={styles.titleAccent}>App</span>Imóvel
                    </h1>
                    <p className={styles.subtitle}>
                        Sistema moderno para gerenciamento e compartilhamento de imóveis
                    </p>
                    <div className={styles.actions}>
                        <Link href="/login" className="btn btn-primary btn-lg">
                            Acessar Painel
                        </Link>
                    </div>
                </div>
                <div className={styles.heroVisual}>
                    <div className={styles.floatingCard}>
                        <div className={styles.cardIcon}>🏠</div>
                        <span>Gerencie Imóveis</span>
                    </div>
                    <div className={styles.floatingCard} style={{ animationDelay: '0.2s' }}>
                        <div className={styles.cardIcon}>📤</div>
                        <span>Compartilhe</span>
                    </div>
                    <div className={styles.floatingCard} style={{ animationDelay: '0.4s' }}>
                        <div className={styles.cardIcon}>🎨</div>
                        <span>Personalize</span>
                    </div>
                </div>
            </div>

            <section className={styles.features}>
                <h2 className={styles.sectionTitle}>Funcionalidades</h2>
                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>📋</div>
                        <h3>Cadastro Completo</h3>
                        <p>Registre todos os detalhes dos seus imóveis com fotos e características</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>📱</div>
                        <h3>Compartilhamento Fácil</h3>
                        <p>Envie imóveis via WhatsApp ou email com apenas um clique</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🎨</div>
                        <h3>Marca Própria</h3>
                        <p>Customize cores, logo e informações da sua imobiliária</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>📱</div>
                        <h3>100% Responsivo</h3>
                        <p>Funciona perfeitamente em celulares, tablets e computadores</p>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <p>&copy; {new Date().getFullYear()} AppImóvel. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}
