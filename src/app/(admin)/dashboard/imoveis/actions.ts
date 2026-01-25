'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function createProperty(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const data = {
        title: formData.get('title') as string,
        address: formData.get('address') as string,
        neighborhood: formData.get('neighborhood') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string || 'RJ',
        totalArea: parseFloat(formData.get('totalArea') as string) || 0,
        propertyType: formData.get('propertyType') as string,
        bedrooms: parseInt(formData.get('bedrooms') as string) || 0,
        suites: parseInt(formData.get('suites') as string) || 0,
        bathrooms: parseInt(formData.get('bathrooms') as string) || 0,
        parkingSpaces: parseInt(formData.get('parkingSpaces') as string) || 0,
        characteristics: formData.get('characteristics') as string,
        price: parseFloat(formData.get('price') as string) || 0,
        condoFee: parseFloat(formData.get('condoFee') as string) || null,
        iptu: parseFloat(formData.get('iptu') as string) || null,
        status: formData.get('status') as string || 'disponivel',
        featured: formData.get('featured') === 'on',
        userId: session.user.id,
    };

    await prisma.property.create({
        data,
    });

    revalidatePath('/dashboard/imoveis');
    redirect('/dashboard/imoveis');
}

export async function updateProperty(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    // Verify ownership
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
        throw new Error('Property not found');
    }
    if (session.user.role !== 'master' && property.userId !== session.user.id) {
        throw new Error('Unauthorized');
    }

    const data = {
        title: formData.get('title') as string,
        address: formData.get('address') as string,
        neighborhood: formData.get('neighborhood') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string || 'RJ',
        totalArea: parseFloat(formData.get('totalArea') as string) || 0,
        propertyType: formData.get('propertyType') as string,
        bedrooms: parseInt(formData.get('bedrooms') as string) || 0,
        suites: parseInt(formData.get('suites') as string) || 0,
        bathrooms: parseInt(formData.get('bathrooms') as string) || 0,
        parkingSpaces: parseInt(formData.get('parkingSpaces') as string) || 0,
        characteristics: formData.get('characteristics') as string,
        price: parseFloat(formData.get('price') as string) || 0,
        condoFee: parseFloat(formData.get('condoFee') as string) || null,
        iptu: parseFloat(formData.get('iptu') as string) || null,
        status: formData.get('status') as string || 'disponivel',
        featured: formData.get('featured') === 'on',
    };

    await prisma.property.update({
        where: { id },
        data,
    });

    revalidatePath('/dashboard/imoveis');
    revalidatePath(`/dashboard/imoveis/${id}`);
    redirect('/dashboard/imoveis');
}

// Soft delete - inactivate instead of delete
export async function deleteProperty(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    // Verify ownership
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
        throw new Error('Property not found');
    }
    if (session.user.role !== 'master' && property.userId !== session.user.id) {
        throw new Error('Unauthorized');
    }

    await prisma.property.update({
        where: { id },
        data: { active: false },
    });

    revalidatePath('/dashboard/imoveis');
    redirect('/dashboard/imoveis');
}

// Restore property
export async function restoreProperty(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    // Verify ownership
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
        throw new Error('Property not found');
    }
    if (session.user.role !== 'master' && property.userId !== session.user.id) {
        throw new Error('Unauthorized');
    }

    await prisma.property.update({
        where: { id },
        data: { active: true },
    });

    revalidatePath('/dashboard/imoveis');
    revalidatePath('/dashboard/imoveis/inativos');
}

// Permanent delete (master only)
export async function permanentDeleteProperty(id: string) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'master') {
        throw new Error('Unauthorized');
    }

    await prisma.property.delete({
        where: { id },
    });

    revalidatePath('/dashboard/imoveis');
    revalidatePath('/dashboard/imoveis/inativos');
}

export async function addPhoto(propertyId: string, formData: FormData) {
    const url = formData.get('url') as string;
    const caption = formData.get('caption') as string;

    const maxOrder = await prisma.photo.findFirst({
        where: { propertyId },
        orderBy: { order: 'desc' },
        select: { order: true },
    });

    await prisma.photo.create({
        data: {
            url,
            caption,
            order: (maxOrder?.order ?? -1) + 1,
            propertyId,
        },
    });

    revalidatePath(`/dashboard/imoveis/${propertyId}`);
}

export async function deletePhoto(id: string, propertyId: string) {
    await prisma.photo.delete({
        where: { id },
    });


    revalidatePath(`/dashboard/imoveis/${propertyId}`);
}

export async function getProperty(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const property = await prisma.property.findUnique({
        where: { id },
        include: { photos: { orderBy: { order: 'asc' } } },
    });

    return property;
}
