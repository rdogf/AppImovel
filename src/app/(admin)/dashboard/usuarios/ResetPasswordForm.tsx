'use client';

import { useActionState, useState } from 'react';
import { resetUserPassword, type ResetPasswordState } from './actions';

const initialState: ResetPasswordState = {};

export default function ResetPasswordForm({ userId }: { userId: string }) {
    const [open, setOpen] = useState(false);
    const [state, formAction, pending] = useActionState(resetUserPassword.bind(null, userId), initialState);

    if (!open) {
        return (
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(true)}>
                Redefinir senha
            </button>
        );
    }

    return (
        <form action={formAction} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <input
                type="text"
                name="password"
                className="form-input"
                placeholder="Nova senha (mín. 6)"
                required
                minLength={6}
                autoComplete="off"
                autoCapitalize="none"
                style={{ maxWidth: 180 }}
            />
            <button type="submit" className="btn btn-sm btn-primary" disabled={pending}>
                {pending ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>
                Fechar
            </button>
            {state.ok && !pending && (
                <p style={{ color: 'var(--color-success, #28a745)', margin: 0, fontSize: '0.85rem', width: '100%' }}>
                    ✅ Senha alterada. Envie a nova senha para o usuário.
                </p>
            )}
            {state.error && !pending && (
                <p style={{ color: 'var(--color-danger)', margin: 0, fontSize: '0.85rem', width: '100%' }}>
                    ⚠️ {state.error}
                </p>
            )}
        </form>
    );
}
