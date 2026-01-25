import prisma from '@/lib/prisma';
import NewPropertyForm from './NewPropertyForm';

export default async function NovoImovelPage() {
    const properties = await prisma.property.findMany({
        select: { id: true, title: true },
        orderBy: { createdAt: 'desc' }
    });

    return <NewPropertyForm properties={properties} />;
}
