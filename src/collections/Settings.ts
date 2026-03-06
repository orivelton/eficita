import type { CollectionConfig } from 'payload'

export const Settings: CollectionConfig = {
  slug: 'settings',
  admin: {
    useAsTitle: 'currency',
    defaultColumns: ['currency', 'language', 'createdBy'],
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
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'EUR',
      required: true,
    },
    { name: 'currencyLocale', type: 'text', defaultValue: 'pt-PT' },
    { name: 'language', type: 'text', defaultValue: 'pt-PT' },
    { name: 'defaultVat', type: 'number', defaultValue: 23 },
    { name: 'quotePrefix', type: 'text', defaultValue: 'ORC' },
    { name: 'quoteValidity', type: 'number', defaultValue: 30 },
    { name: 'companyDefaultColor', type: 'text', defaultValue: '#1a56db' },
    { name: 'defaultTemplate', type: 'text', defaultValue: 'classico' },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'customers',
    },
  ],
}
