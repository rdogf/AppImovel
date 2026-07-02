import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { toggleUserActive } from './actions';
import AddUserForm from './AddUserForm';
import styles from './page.module.css';

export default async function UsuariosPage() {
    const session = await auth();

    // Only master and admin can manage users
    if (session?.user?.role === 'user' || !session?.user?.role) {
        redirect('/dashboard');
    }

    const isMaster = session.user.role === 'master';
    const whereClause: any = isMaster ? {} : { parentId: session.user.id };

    const users = await prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { properties: true } },
        },
    });

    // Lista de admins para vincular coordenadores (apenas master escolhe)
    const admins = isMaster
        ? await prisma.user.findMany({
            where: { role: 'admin', active: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        })
        : [];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Usuários</h1>
                    <p className={styles.subtitle}>{users.length} usuário(s) cadastrado(s)</p>
                </div>
            </header>

            {/* Add User Form */}
            <AddUserForm isMaster={isMaster} admins={admins} />

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
                                    <span className={`badge ${user.role === 'master' ? 'status-disponivel' : user.role === 'admin' ? 'status-reservado' : 'status-alugado'}`}>
                                        {user.role === 'master' ? 'Master' : user.role === 'admin' ? 'Admin' : 'Coordenador'}
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
