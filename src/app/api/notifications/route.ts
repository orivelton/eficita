import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const user = (await payload.findByID({
      collection: 'users',
      id: req.headers.get('x-user-id') || '',
    })) as any
    const docs = await payload.find({
      collection: 'notifications',
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
      collection: 'users',
      id: req.headers.get('x-user-id') || '',
    })) as any
    const created = await payload.create({
      collection: 'notifications',
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
    const updated = await payload.update({
      collection: 'notifications',
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
    await payload.delete({ collection: 'notifications', id } as any)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
