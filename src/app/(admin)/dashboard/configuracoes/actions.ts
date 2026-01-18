'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function updateSettings(formData: FormData) {
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

    // Upsert settings (create if not exists, update if exists)
    const existingSettings = await prisma.settings.findFirst();

    if (existingSettings) {
        await prisma.settings.update({
            where: { id: existingSettings.id },
            data,
        });
    } else {
        await prisma.settings.create({ data });
    }

    revalidatePath('/dashboard/configuracoes');
    revalidatePath('/imovel');
}

export async function getSettings() {
    let settings = await prisma.settings.findFirst();

    if (!settings) {
        settings = await prisma.settings.create({
            data: {},
        });
    }

    return settings;
}
