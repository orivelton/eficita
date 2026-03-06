import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'read', 'createdAt'],
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
      name: 'type',
      type: 'select',
      options: ['info', 'success', 'warning', 'quote'],
      required: true,
    },
    { name: 'title', type: 'text', required: true },
    { name: 'message', type: 'textarea' },
    { name: 'read', type: 'checkbox', defaultValue: false },
    {
      name: 'createdAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'customers',
    },
  ],
}
