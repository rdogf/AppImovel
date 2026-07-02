'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export interface CreateUserState {
    error?: string;
}

export async function createUser(_prevState: CreateUserState, formData: FormData): Promise<CreateUserState> {
    const session = await auth();
    if (session?.user?.role === 'user' || !session?.user?.role) {
        return { error: 'Você não tem permissão para criar usuários.' };
    }

    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: 'Preencha nome, e-mail e senha.' };
    }
    if (password.length < 6) {
        return { error: 'A senha deve ter no mínimo 6 caracteres.' };
    }

    // Definição de papel e organização (parent)
    let role: 'admin' | 'user';
    let parentId: string | null;

    if (session.user.role === 'master') {
        // Master pode escolher: Admin ou Coordenador (usuário)
        role = formData.get('role') === 'admin' ? 'admin' : 'user';
        if (role === 'admin') {
            parentId = null;
        } else {
            // Coordenador pode ser vinculado a um admin responsável (opcional)
            const chosenParent = (formData.get('parentId') as string) || '';
            if (chosenParent) {
                const parent = await prisma.user.findUnique({ where: { id: chosenParent } });
                parentId = parent && parent.role === 'admin' ? parent.id : null;
            } else {
                parentId = null;
            }
        }
    } else {
        // Admin sempre cria coordenadores dentro da sua organização
        role = 'user';
        parentId = session.user.id;
    }

    // Evita o erro de constraint exibindo mensagem amigável
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { error: 'Já existe um usuário com este e-mail.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                parentId,
            } as any,
        });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return { error: 'Já existe um usuário com este e-mail.' };
        }
        console.error('Failed to create user:', error);
        return { error: 'Erro ao criar usuário. Tente novamente.' };
    }

    revalidatePath('/dashboard/usuarios');
    redirect('/dashboard/usuarios');
}

export async function updateUser(id: string, formData: FormData) {
    const session = await auth();
    if (session?.user?.role === 'user' || !session?.user?.role) {
        throw new Error('Unauthorized');
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) throw new Error('User not found');

    if (session.user.role !== 'master' && targetUser.parentId !== session.user.id) {
        throw new Error('Unauthorized');
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const data: { name: string; email: string; password?: string } = {
        name,
        email,
    };

    if (password) {
        data.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
        where: { id },
        data,
    });

    revalidatePath('/dashboard/usuarios');
}

export async function toggleUserActive(id: string) {
    const session = await auth();
    if (session?.user?.role === 'user' || !session?.user?.role) {
        throw new Error('Unauthorized');
    }

    // Cannot deactivate yourself
    if (session.user.id === id) {
        throw new Error('Cannot deactivate yourself');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error('User not found');
    }

    if (session.user.role !== 'master' && user.parentId !== session.user.id) {
        throw new Error('Unauthorized');
    }

    await prisma.user.update({
        where: { id },
        data: { active: !user.active },
    });

    revalidatePath('/dashboard/usuarios');
}
