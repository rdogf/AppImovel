'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export interface ProfileState {
    error?: string;
    success?: string;
}

export async function updateOwnProfile(_prevState: ProfileState, formData: FormData): Promise<ProfileState> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Você precisa estar autenticado.' };
    }

    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!name || !email) {
        return { error: 'Preencha nome e e-mail.' };
    }

    // E-mail deve ser único (ignorando o próprio usuário)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== session.user.id) {
        return { error: 'Já existe um usuário com este e-mail.' };
    }

    const data: { name: string; email: string; password?: string } = { name, email };

    // Troca de senha é opcional; se preenchida, exige a senha atual correta
    if (newPassword) {
        if (newPassword.length < 6) {
            return { error: 'A nova senha deve ter no mínimo 6 caracteres.' };
        }
        const me = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!me) {
            return { error: 'Usuário não encontrado.' };
        }
        const passwordMatch = await bcrypt.compare(currentPassword || '', me.password);
        if (!passwordMatch) {
            return { error: 'Senha atual incorreta.' };
        }
        data.password = await bcrypt.hash(newPassword, 10);
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data,
        });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return { error: 'Já existe um usuário com este e-mail.' };
        }
        console.error('Failed to update profile:', error);
        return { error: 'Erro ao salvar. Tente novamente.' };
    }

    revalidatePath('/dashboard/perfil');

    const emailChanged = email !== session.user.email?.toLowerCase();
    return {
        success: emailChanged
            ? 'Dados atualizados! Como você alterou o e-mail, faça login novamente para atualizar a sessão.'
            : 'Dados atualizados com sucesso!',
    };
}
