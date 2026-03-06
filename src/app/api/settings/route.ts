import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

async function getUserFromHeader(req: NextRequest) {
  const id = req.headers.get('x-user-id')
  if (!id) return null
  const payload = await getPayload({ config })
  return payload.findByID({ collection: 'customers', id, depth: 0 })
}

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const user = await getUserFromHeader(req)
    const where = (user as any)?.roles?.includes('admin')
      ? undefined
      : { createdBy: { equals: (user as any)?.id } }
    const docs = await payload.find({
      collection: 'settings',
      where,
      depth: 0,
      limit: 1,
    } as any)
    // return first or default
    const result = docs.docs[0] || null
    return NextResponse.json(result)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(null, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const user = await getUserFromHeader(req)
    const payload = await getPayload({ config })
    // either create or update existing setting for user
    const existing = await payload.find({
      collection: 'settings',
      where: { createdBy: { equals: (user as any)?.id } },
      depth: 0,
      limit: 1,
    } as any)
    let result
    if (existing.docs.length > 0) {
      const id = existing.docs[0].id
      result = await payload.update({
        collection: 'settings',
        id,
        data,
      } as any)
    } else {
      result = await payload.create({
        collection: 'settings',
        data: { ...data, createdBy: (user as any)?.id },
      } as any)
    }
    return NextResponse.json(result)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
