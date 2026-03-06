import type { CollectionConfig } from 'payload'

export const NotesTemplates: CollectionConfig = {
  slug: 'notes-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'createdAt'],
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => {
      const u = user as any
      if (!u) return false
      if (u?.collection === 'users') return true
      return { createdBy: { equals: u.id } }
    },
    update: ({ req: { user }, id }) => {
      const u = user as any
      if (u?.roles?.includes('admin')) return true
      return { createdBy: { equals: u?.id } }
    },
    delete: ({ req: { user }, id }) => {
      const u = user as any
      if (u?.roles?.includes('admin')) return true
      return { createdBy: { equals: u?.id } }
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'content', type: 'textarea', required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: ['geral', 'pagamento', 'prazo', 'garantia', 'material', 'outro'],
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'customers',
    },
    { name: 'createdAt', type: 'date', defaultValue: () => new Date().toISOString() },
    { name: 'updatedAt', type: 'date', defaultValue: () => new Date().toISOString() },
  ],
}
