'use client';

import { useActionState } from 'react';
import { updateOwnProfile, type ProfileState } from './actions';
import styles from '../usuarios/page.module.css';

interface ProfileFormProps {
    name: string;
    email: string;
    roleLabel: string;
}

const initialState: ProfileState = {};

export default function ProfileForm({ name, email, roleLabel }: ProfileFormProps) {
    const [state, formAction, pending] = useActionState(updateOwnProfile, initialState);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Meu Perfil</h1>
                <p className={styles.subtitle}>Atualize seus dados de acesso · {roleLabel}</p>
            </header>

            <div className={styles.addForm}>
                <h2>Dados Pessoais</h2>
                <form action={formAction} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Nome *</label>
                            <input type="text" id="name" name="name" className="form-input" defaultValue={name} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">E-mail *</label>
                            <input type="email" id="email" name="email" className="form-input" defaultValue={email} required />
                        </div>
                    </div>

                    <h2 style={{ marginTop: 'var(--spacing-md)' }}>Alterar Senha <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, fontSize: '0.85rem' }}>(opcional)</span></h2>
                    <div className={styles.formGrid}>
                        <div className="form-group">
                            <label htmlFor="currentPassword" className="form-label">Senha atual</label>
                            <input type="password" id="currentPassword" name="currentPassword" className="form-input" autoComplete="current-password" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword" className="form-label">Nova senha</label>
                            <input type="password" id="newPassword" name="newPassword" className="form-input" minLength={6} autoComplete="new-password" />
                        </div>
                    </div>

                    {state.error && (
                        <p style={{ color: 'var(--color-danger)', margin: 0, fontSize: '0.9rem' }}>
                            ⚠️ {state.error}
                        </p>
                    )}
                    {state.success && (
                        <p style={{ color: '#1a7f37', margin: 0, fontSize: '0.9rem' }}>
                            ✅ {state.success}
                        </p>
                    )}

                    <button type="submit" className="btn btn-secondary" disabled={pending}>
                        {pending ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </form>
            </div>
        </div>
    );
}
