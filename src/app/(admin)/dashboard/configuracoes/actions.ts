'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Get global app settings (app name, logo)
export async function getGlobalSettings() {
    let settings = await prisma.globalSettings.findFirst();
    if (!settings) {
        settings = await prisma.globalSettings.create({
            data: { appName: 'AppImóvel' }
        });
    }
    return settings;
}

// Update global app settings (master only)
export async function updateGlobalSettings(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'master') return;

    const appName = formData.get('appName') as string;
    const appLogo = formData.get('appLogo') as string || null;

    const existing = await prisma.globalSettings.findFirst();
    if (existing) {
        await prisma.globalSettings.update({
            where: { id: existing.id },
            data: { appName, appLogo }
        });
    } else {
        await prisma.globalSettings.create({
            data: { appName, appLogo }
        });
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/configuracoes');
}

// Get user settings (per-user)
export async function getUserSettings(userId?: string) {
    const session = await auth();
    const targetUserId = userId || session?.user?.id;

    if (!targetUserId) return null;

    let settings = await prisma.userSettings.findUnique({
        where: { userId: targetUserId }
    });

    if (!settings) {
        settings = await prisma.userSettings.create({
            data: { userId: targetUserId }
        });
    }

    return settings;
}

// Update user settings
export async function updateUserSettings(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return;

    const data = {
        primaryColor: formData.get('primaryColor') as string,
        secondaryColor: formData.get('secondaryColor') as string,
        accentColor: formData.get('accentColor') as string,
        logoUrl: formData.get('logoUrl') as string || null,
        companyName: formData.get('companyName') as string,
        aboutTitle: formData.get('aboutTitle') as string,
        aboutText: formData.get('aboutText') as string,
        whatsappNumber: formData.get('whatsappNumber') as string || null,
        email: formData.get('email') as string || null,
        address: formData.get('address') as string || null,
    };

    await prisma.userSettings.upsert({
        where: { userId: session.user.id },
        update: data,
        create: { ...data, userId: session.user.id }
    });

    revalidatePath('/dashboard/configuracoes');
    revalidatePath('/imovel');
}

// Legacy function for compatibility
export async function getSettings() {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
        settings = await prisma.settings.create({ data: {} });
    }
    return settings;
}

export async function updateSettings(formData: FormData) {
    // Redirect to updateUserSettings
    return updateUserSettings(formData);
}
