import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';

export default async function PerfilPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    const me = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, role: true },
    });

    if (!me) {
        redirect('/login');
    }

    const roleLabel = me.role === 'master' ? 'Master' : me.role === 'admin' ? 'Admin' : 'Coordenador';

    return <ProfileForm name={me.name} email={me.email} roleLabel={roleLabel} />;
}
