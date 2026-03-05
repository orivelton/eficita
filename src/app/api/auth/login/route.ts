import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const payload = await getPayload({ config })

    // attempt login, fall back to creating the account in development if it doesn't exist
    let result
    try {
      result = await payload.login({
        collection: 'users',
        email,
        password,
      } as any)
    } catch (loginErr: any) {
      if (
        process.env.NODE_ENV !== 'production' &&
        loginErr.message?.toLowerCase().includes('not found')
      ) {
        await payload.create({
          collection: 'users',
          data: { email, password },
        } as any)
        result = await payload.login({
          collection: 'users',
          email,
          password,
        } as any)
      } else {
        // rethrow so outer catch block handles it
        throw loginErr
      }
    }

    // the result includes `user` and `token`
    if (!result?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 401 },
      )
    }

    return NextResponse.json({ success: true, user: result.user, token: result.token })
  } catch (err: any) {
    console.error('login error', err)
    return NextResponse.json(
      { success: false, message: err?.message || 'Unknown error' },
      { status: 500 },
    )
  }
}
