import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import MobileSidebar from '@/components/admin/MobileSidebar';
import styles from './layout.module.css';

async function getAppName() {
    const globalSettings = await prisma.globalSettings.findFirst();
    return globalSettings?.appName || 'AppImóvel';
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const appName = await getAppName();

    if (!session) {
        redirect('/login');
    }

    const handleLogout = async () => {
        'use server';
        await signOut({ redirectTo: '/login' });
    };

    return (
        <div className={styles.container}>
            {/* Mobile Sidebar */}
            <MobileSidebar
                userName={session.user?.name || 'Admin'}
                userEmail={session.user?.email || ''}
                userRole={session.user?.role || 'admin'}
                appName={appName}
                onLogout={handleLogout}
            />

            {/* Desktop Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <Link href="/dashboard">
                        <span className={styles.logoAccent}>{appName.substring(0, 3)}</span>{appName.substring(3)}
                    </Link>
                </div>

                <nav className={styles.nav}>
                    <Link href="/dashboard" className={styles.navItem}>
                        <span className={styles.navIcon}>📊</span>
                        Dashboard
                    </Link>
                    <Link href="/dashboard/imoveis" className={styles.navItem}>
                        <span className={styles.navIcon}>🏠</span>
                        Imóveis
                    </Link>
                    {session.user?.role === 'master' && (
                        <Link href="/dashboard/usuarios" className={styles.navItem}>
                            <span className={styles.navIcon}>👥</span>
                            Usuários
                        </Link>
                    )}
                    <Link href="/dashboard/configuracoes" className={styles.navItem}>
                        <span className={styles.navIcon}>⚙️</span>
                        Configurações
                    </Link>
                </nav>

                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <span className={styles.userAvatar}>
                            {session.user?.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>
                                {session.user?.name || 'Admin'}
                                {session.user?.role === 'master' && <small style={{ marginLeft: '4px', opacity: 0.7 }}>👑</small>}
                            </span>
                            <span className={styles.userEmail}>{session.user?.email}</span>
                        </div>
                    </div>
                    <form action={handleLogout}>
                        <button type="submit" className={styles.logoutBtn} title="Sair">
                            🚪
                        </button>
                    </form>
                </div>
            </aside>

            <main className={styles.main}>
                <div className={styles.content}>{children}</div>
            </main>
        </div>
    );
}
