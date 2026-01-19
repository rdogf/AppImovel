'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileSidebar.module.css';

interface MobileSidebarProps {
    userName: string;
    userEmail: string;
    userRole: string;
    appName: string;
    onLogout: () => void;
}

export default function MobileSidebar({ userName, userEmail, userRole, appName, onLogout }: MobileSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Hamburger Button */}
            <button
                className={styles.hamburger}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu"
            >
                <span className={`${styles.line} ${isOpen ? styles.open : ''}`}></span>
                <span className={`${styles.line} ${isOpen ? styles.open : ''}`}></span>
                <span className={`${styles.line} ${isOpen ? styles.open : ''}`}></span>
            </button>

            {/* Overlay */}
            {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Fechar">
                        ✕
                    </button>
                    <div className={styles.logo}>
                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                            <span className={styles.logoAccent}>{appName.substring(0, 3)}</span>{appName.substring(3)}
                        </Link>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <Link href="/dashboard" className={styles.navItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.navIcon}>📊</span>
                        Dashboard
                    </Link>
                    <Link href="/dashboard/imoveis" className={styles.navItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.navIcon}>🏠</span>
                        Imóveis
                    </Link>
                    {userRole === 'master' && (
                        <Link href="/dashboard/usuarios" className={styles.navItem} onClick={() => setIsOpen(false)}>
                            <span className={styles.navIcon}>👥</span>
                            Usuários
                        </Link>
                    )}
                    <Link href="/dashboard/configuracoes" className={styles.navItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.navIcon}>⚙️</span>
                        Configurações
                    </Link>
                </nav>

                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <span className={styles.userAvatar}>
                            {userName.charAt(0).toUpperCase()}
                        </span>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>
                                {userName}
                                {userRole === 'master' && <small style={{ marginLeft: '4px', opacity: 0.7 }}>👑</small>}
                            </span>
                            <span className={styles.userEmail}>{userEmail}</span>
                        </div>
                    </div>
                    <form action={onLogout}>
                        <button type="submit" className={styles.logoutBtn} title="Sair">
                            🚪
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
