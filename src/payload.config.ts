import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Customers } from './collections/Customers'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Clients } from './collections/Clients'
import { Quotes } from './collections/Quotes'
import { NotesTemplates } from './collections/NotesTemplates'
import { ServiceTemplates } from './collections/ServiceTemplates'
import { Settings } from './collections/Settings'
import { Companies } from './collections/Companies'
import { Notifications } from './collections/Notifications'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Customers,
    Media,
    Companies,
    Clients,
    Quotes,
    NotesTemplates,
    ServiceTemplates,
    Settings,
    Notifications,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
