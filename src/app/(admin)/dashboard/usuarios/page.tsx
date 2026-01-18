import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createUser, toggleUserActive } from './actions';
import styles from './page.module.css';

export default async function UsuariosPage() {
    const session = await auth();

    // Only master can manage users
    if (session?.user?.role !== 'master') {
        redirect('/dashboard');
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { properties: true } },
        },
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Usuários</h1>
                    <p className={styles.subtitle}>{users.length} usuário(s) cadastrado(s)</p>
                </div>
            </header>

            {/* Add User Form */}
            <div className={styles.addForm}>
                <h2>Adicionar Novo Usuário</h2>
                <form action={createUser} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Nome *</label>
                            <input type="text" id="name" name="name" className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">E-mail *</label>
                            <input type="email" id="email" name="email" className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Senha *</label>
                            <input type="password" id="password" name="password" className="form-input" required minLength={6} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-secondary">
                        Criar Usuário
                    </button>
                </form>
            </div>

            {/* Users List */}
            <div className={styles.usersList}>
                {users.map((user) => (
                    <div key={user.id} className={`${styles.userCard} ${!user.active ? styles.inactive : ''}`}>
                        <div className={styles.userInfo}>
                            <div className={styles.avatar}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3>{user.name}</h3>
                                <p>{user.email}</p>
                                <div className={styles.badges}>
                                    <span className={`badge ${user.role === 'master' ? 'status-disponivel' : 'status-reservado'}`}>
                                        {user.role === 'master' ? 'Master' : 'Admin'}
                                    </span>
                                    {!user.active && (
                                        <span className="badge" style={{ background: '#6c757d' }}>Inativo</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.userStats}>
                            <span>{user._count.properties} imóvel(is)</span>
                        </div>
                        {user.role !== 'master' && (
                            <div className={styles.userActions}>
                                <form action={toggleUserActive.bind(null, user.id)}>
                                    <button
                                        type="submit"
                                        className={`btn btn-sm ${user.active ? 'btn-ghost' : 'btn-primary'}`}
                                    >
                                        {user.active ? 'Desativar' : 'Ativar'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
