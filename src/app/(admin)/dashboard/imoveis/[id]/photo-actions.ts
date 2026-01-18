'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function updatePhotoOrder(propertyId: string, photoIds: string[]) {
    // Update the order of photos based on the array order
    await Promise.all(
        photoIds.map((id, index) =>
            prisma.photo.update({
                where: { id },
                data: { order: index },
            })
        )
    );

    revalidatePath(`/dashboard/imoveis/${propertyId}`);
    return { success: true };
}
