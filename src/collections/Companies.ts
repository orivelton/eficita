import type { CollectionConfig } from 'payload'

export const Companies: CollectionConfig = {
  slug: 'companies',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'nif', 'email', 'createdAt'],
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
    { name: 'nif', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'iban', type: 'text' },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'primaryColor', type: 'text', defaultValue: '#1a56db' },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}
