export interface SessionUser {
    id: string;
    role: string;
    parentId?: string | null;
}

export type PropertyOwner = {
    userId: string | null;
    user?: { parentId: string | null } | null;
};

/**
 * Regra de edição das fichas:
 * - master: todas as fichas;
 * - admin: fichas próprias e dos coordenadores que gerencia (parentId = admin);
 * - user (coordenador): todas as fichas da sua organização (mesmo admin/parent),
 *   incluindo as do próprio admin e as dos demais coordenadores.
 */
export function canEditProperty(user: SessionUser, property: PropertyOwner): boolean {
    if (user.role === 'master') return true;

    const isOwner = property.userId === user.id;
    if (isOwner) return true;

    if (user.role === 'admin') {
        return property.user?.parentId === user.id;
    }

    if (user.role === 'user') {
        const orgId = user.parentId;
        if (!orgId) return false;
        // ficha do próprio admin da organização, ou de um coordenador irmão
        return property.userId === orgId || property.user?.parentId === orgId;
    }

    return false;
}
