import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    { name: 'name', type: 'text' },
    // Email added by default via auth
    // Add more fields as needed for customers
  ],
}
