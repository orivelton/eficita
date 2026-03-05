import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

async function getUserFromHeader(req: NextRequest) {
  const id = req.headers.get('x-user-id')
  if (!id) return null
  const payload = await getPayload({ config })
  return payload.findByID({ collection: 'users', id, depth: 0 })
}

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const user = await getUserFromHeader(req)
    const where = (user as any)?.roles?.includes('admin')
      ? undefined
      : { createdBy: { equals: (user as any)?.id } }
    const docs = await payload.find({
      collection: 'notes-templates',
      where,
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
    const user = await getUserFromHeader(req)
    const payload = await getPayload({ config })
    const created = await payload.create({
      collection: 'notes-templates',
      data: { ...data, createdBy: (user as any)?.id },
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
    const updated = await payload.update({
      collection: 'notes-templates',
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
    await payload.delete({ collection: 'notes-templates', id } as any)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
