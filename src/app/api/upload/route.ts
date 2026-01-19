import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    // Check authentication
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const propertyId = formData.get('propertyId') as string | null;
        const uploadType = formData.get('type') as string | null; // 'logo' or 'property'
        const files = formData.getAll('files') as File[];
        const singleFile = formData.get('file') as File | null;

        // Handle single file upload (for logos)
        const filesToProcess = singleFile ? [singleFile] : files;

        if (!filesToProcess || filesToProcess.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        // For logo uploads, use a different directory
        if (uploadType === 'logo') {
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos');
            await mkdir(uploadDir, { recursive: true });

            const uploadedUrls: string[] = [];

            for (const file of filesToProcess) {
                if (!file.type.startsWith('image/')) {
                    continue;
                }

                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 8);
                const extension = file.name.split('.').pop() || 'png';
                const filename = `${timestamp}-${randomStr}.${extension}`;
                const filepath = join(uploadDir, filename);

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                await writeFile(filepath, buffer);

                uploadedUrls.push(`/uploads/logos/${filename}`);
            }

            return NextResponse.json({
                success: true,
                urls: uploadedUrls
            });
        }

        // For property photos, require propertyId
        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', propertyId);
        await mkdir(uploadDir, { recursive: true });

        // Get current max order
        const maxOrderPhoto = await prisma.photo.findFirst({
            where: { propertyId },
            orderBy: { order: 'desc' },
            select: { order: true },
        });
        let currentOrder = (maxOrderPhoto?.order ?? -1) + 1;

        const uploadedPhotos = [];

        for (const file of filesToProcess) {
            if (!file.type.startsWith('image/')) {
                continue; // Skip non-image files
            }

            // Generate unique filename
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const extension = file.name.split('.').pop() || 'jpg';
            const filename = `${timestamp}-${randomStr}.${extension}`;
            const filepath = join(uploadDir, filename);

            // Write file to disk
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filepath, buffer);

            // Save to database
            const photo = await prisma.photo.create({
                data: {
                    url: `/uploads/${propertyId}/${filename}`,
                    caption: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for caption
                    order: currentOrder++,
                    propertyId,
                },
            });

            uploadedPhotos.push(photo);
        }

        revalidatePath(`/dashboard/imoveis/${propertyId}`);

        return NextResponse.json({
            success: true,
            uploaded: uploadedPhotos.length,
            photos: uploadedPhotos,
            urls: uploadedPhotos.map(p => p.url)
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
    }
}
