'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login } from './actions';
import styles from './page.module.css';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button type="submit" className="btn btn-secondary btn-lg" disabled={pending}>
            {pending ? (
                <>
                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                    Entrando...
                </>
            ) : (
                'Entrar'
            )}
        </button>
    );
}

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
        }
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <span className={styles.accent}>App</span>Imóvel
                </h1>
                <p className={styles.subtitle}>Faça login para acessar o painel</p>
            </div>

            <form action={handleSubmit} className={styles.form}>
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-input"
                        placeholder="seu@email.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="form-label">Senha</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-input"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <SubmitButton />
            </form>

            <div className={styles.footer}>
                <Link href="/" className={styles.link}>
                    ← Voltar para o início
                </Link>
            </div>
        </div>
    );
}
