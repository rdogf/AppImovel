'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { canEditProperty } from '@/lib/permissions';

async function recordHistory(propertyId: string, action: 'create' | 'update') {
    const session = await auth();
    if (!session?.user?.id) return;
    try {
        await prisma.propertyHistory.create({
            data: {
                propertyId,
                action,
                userId: session.user.id,
                userName: session.user.name || session.user.email || 'Usuário',
                userRole: session.user.role,
            },
        });
    } catch (error) {
        console.error('Failed to record property history:', error);
    }
}

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
        outstandingBalance: parseFloat(formData.get('outstandingBalance') as string) || null,
        unitNumber: (formData.get('unitNumber') as string)?.trim() || null,
        status: formData.get('status') as string || 'disponivel',
        featured: formData.get('featured') === 'on',
        userId: session.user.id,
    };

    const created = await prisma.property.create({
        data,
    });

    await recordHistory(created.id, 'create');

    revalidatePath('/dashboard/imoveis');
    redirect('/dashboard/imoveis');
}

export async function updateProperty(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    // Verify ownership
    const property = await prisma.property.findUnique({
        where: { id },
        include: { user: true }
    });
    if (!property) {
        throw new Error('Property not found');
    }

    if (!canEditProperty(session.user, property)) {
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
        outstandingBalance: parseFloat(formData.get('outstandingBalance') as string) || null,
        unitNumber: (formData.get('unitNumber') as string)?.trim() || null,
        status: formData.get('status') as string || 'disponivel',
        featured: formData.get('featured') === 'on',
    };

    await prisma.property.update({
        where: { id },
        data,
    });

    await recordHistory(id, 'update');

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
    const property = await prisma.property.findUnique({
        where: { id },
        include: { user: true }
    });
    if (!property) {
        throw new Error('Property not found');
    }

    const isOwner = property.userId === session.user.id;
    const isMaster = session.user.role === 'master';
    const isParentAdmin = session.user.role === 'admin' && property.user?.parentId === session.user.id;

    if (!isMaster && !isOwner && !isParentAdmin) {
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
    const property = await prisma.property.findUnique({
        where: { id },
        include: { user: true }
    });
    if (!property) {
        throw new Error('Property not found');
    }

    const isOwner = property.userId === session.user.id;
    const isMaster = session.user.role === 'master';
    const isParentAdmin = session.user.role === 'admin' && property.user?.parentId === session.user.id;

    if (!isMaster && !isOwner && !isParentAdmin) {
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

export async function incrementPdfCount(id: string) {
    try {
        await prisma.property.update({
            where: { id },
            data: { pdfGeneratedCount: { increment: 1 } },
        });
    } catch (error) {
        console.error('Failed to increment PDF count:', error);
    }
}
