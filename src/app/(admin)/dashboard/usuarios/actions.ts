'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function createUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'master') {
        throw new Error('Unauthorized');
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: 'admin',
        },
    });

    revalidatePath('/dashboard/usuarios');
    redirect('/dashboard/usuarios');
}

export async function updateUser(id: string, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'master') {
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
    if (session?.user?.role !== 'master') {
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

    await prisma.user.update({
        where: { id },
        data: { active: !user.active },
    });

    revalidatePath('/dashboard/usuarios');
}
