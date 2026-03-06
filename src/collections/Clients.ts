import type { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'createdAt'],
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
      if (u?.collection === 'users') return true
      return { createdBy: { equals: u?.id } }
    },
    delete: ({ req: { user }, id }) => {
      const u = user as any
      if (u?.collection === 'users') return true
      return { createdBy: { equals: u?.id } }
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'nif', type: 'text' },
    { name: 'address', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'text' },
    { name: 'workAddress', type: 'text' },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'customers',
    },
  ],
}
