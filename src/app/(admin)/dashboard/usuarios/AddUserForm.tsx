'use client';

import { useActionState, useState } from 'react';
import { createUser, type CreateUserState } from './actions';
import styles from './page.module.css';

interface AdminOption {
    id: string;
    name: string;
}

interface AddUserFormProps {
    isMaster: boolean;
    admins: AdminOption[];
}

const initialState: CreateUserState = {};

export default function AddUserForm({ isMaster, admins }: AddUserFormProps) {
    const [state, formAction, pending] = useActionState(createUser, initialState);
    const [role, setRole] = useState<'user' | 'admin'>('user');

    return (
        <div className={styles.addForm}>
            <h2>Adicionar Novo Usuário</h2>
            <form action={formAction} className={styles.form}>
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

                {isMaster && (
                    <div className={styles.formGrid}>
                        <div className="form-group">
                            <label htmlFor="role" className="form-label">Tipo de usuário *</label>
                            <select
                                id="role"
                                name="role"
                                className="form-select"
                                value={role}
                                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                            >
                                <option value="user">Coordenador</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {role === 'user' && admins.length > 0 && (
                            <div className="form-group">
                                <label htmlFor="parentId" className="form-label">Admin responsável</label>
                                <select id="parentId" name="parentId" className="form-select" defaultValue="">
                                    <option value="">Sem vínculo</option>
                                    {admins.map((admin) => (
                                        <option key={admin.id} value={admin.id}>{admin.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {state.error && (
                    <p style={{ color: 'var(--color-danger)', margin: 0, fontSize: '0.9rem' }}>
                        ⚠️ {state.error}
                    </p>
                )}

                <button type="submit" className="btn btn-secondary" disabled={pending}>
                    {pending ? 'Criando...' : 'Criar Usuário'}
                </button>
            </form>
        </div>
    );
}
