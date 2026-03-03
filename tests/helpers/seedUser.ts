import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

import { DEMO_CREDENTIALS } from '../../src/lib/auth'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // create fresh test user
  await payload.create({
    collection: 'users',
    data: testUser,
  })

  // also ensure demo account exists (used by frontend demo button)
  await payload.delete({
    collection: 'users',
    where: { email: { equals: DEMO_CREDENTIALS.email } },
  })
  await payload.create({
    collection: 'users',
    data: DEMO_CREDENTIALS,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
