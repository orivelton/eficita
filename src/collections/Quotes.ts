import type { CollectionConfig } from 'payload'

export const Quotes: CollectionConfig = {
  slug: 'quotes',
  admin: {
    useAsTitle: 'number',
    defaultColumns: ['number', 'company', 'client', 'status', 'updatedAt'],
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
    { name: 'number', type: 'text', required: true, unique: true, index: true },
    { name: 'projectTitle', type: 'text' },
    { name: 'createdAt', type: 'date', defaultValue: () => new Date().toISOString().split('T')[0] },
    { name: 'validUntil', type: 'date' },
    { name: 'notes', type: 'textarea' },
    {
      name: 'company',
      type: 'relationship',
      relationTo: 'companies' as any,
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients' as any,
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'serviceName', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'quantity', type: 'number' },
        { name: 'unit', type: 'text' },
        { name: 'unitPrice', type: 'number' },
        { name: 'vatPercentage', type: 'number' },
      ],
    },
    {
      name: 'updatedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'status',
      type: 'select',
      options: ['rascunho', 'enviado', 'em_analise', 'aceite', 'recusado', 'expirado'],
      defaultValue: 'rascunho',
    },
    {
      name: 'history',
      type: 'array',
      fields: [
        { name: 'status', type: 'text' },
        { name: 'date', type: 'date' },
        { name: 'note', type: 'text' },
      ],
    },
    { name: 'templateId', type: 'text' },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}
