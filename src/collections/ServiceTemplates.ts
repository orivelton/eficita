import type { CollectionConfig } from 'payload'

export const ServiceTemplates: CollectionConfig = {
  slug: 'service-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'unitPrice', 'createdAt'],
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => {
      const u = user as any
      if (!u) return false
      if (u.email === 'orivelton10@gmail.com') return true
      return { createdBy: { equals: u.id } }
    },
    update: ({ req: { user }, id }) => {
      const u = user as any
      if (u.email === 'orivelton10@gmail.com') return true
      return { createdBy: { equals: u?.id } }
    },
    delete: ({ req: { user }, id }) => {
      const u = user as any
      if (u.email === 'orivelton10@gmail.com') return true
      return { createdBy: { equals: u?.id } }
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'text' },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        'construcao',
        'eletricidade',
        'canalizacao',
        'pintura',
        'limpeza',
        'consultoria',
        'manutencao',
        'outro',
      ],
    },
    { name: 'unit', type: 'text', required: true },
    { name: 'unitPrice', type: 'number', required: true },
    { name: 'vatPercentage', type: 'number', required: true },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
    },
    { name: 'createdAt', type: 'date', defaultValue: () => new Date().toISOString() },
    { name: 'updatedAt', type: 'date', defaultValue: () => new Date().toISOString() },
  ],
}
