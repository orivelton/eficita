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
    const user = (await payload.findByID({
      collection: 'customers',
      id: req.headers.get('x-user-id') || '',
    })) as any
    const docs = await payload.find({
      collection: 'clients',
      where: (user as any)?.roles?.includes('admin')
        ? undefined
        : { createdBy: { equals: user?.id } },
      depth: 0,
    } as any)
    return NextResponse.json(docs.docs)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const payload = await getPayload({ config })
    const user = (await payload.findByID({
      collection: 'customers',
      id: req.headers.get('x-user-id') || '',
    })) as any
    const created = await payload.create({
      collection: 'clients',
      data: { ...data, createdBy: user?.id },
    } as any)
    return NextResponse.json(created)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...data } = await req.json()
    const payload = await getPayload({ config })
    const user = await getUserFromHeader(req)

    // Check if user can update this client
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If not admin, check if user owns the client
    if (!(user as any)?.roles?.includes('admin')) {
      const existingClient = await payload.findByID({
        collection: 'clients',
        id,
        depth: 0,
      } as any)

      if (!existingClient || (existingClient as any).created_by_id !== user.id) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 })
      }
    }

    const updated = await payload.update({
      collection: 'clients',
      id,
      data,
    } as any)
    return NextResponse.json(updated)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const payload = await getPayload({ config })
    const user = await getUserFromHeader(req)

    // Check if user can delete this client
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If not admin, check if user owns the client
    if (!(user as any)?.roles?.includes('admin')) {
      const existingClient = await payload.findByID({
        collection: 'clients',
        id,
        depth: 0,
      } as any)

      if (!existingClient || (existingClient as any).created_by_id !== user.id) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 })
      }
    }

    await payload.delete({ collection: 'clients', id } as any)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
