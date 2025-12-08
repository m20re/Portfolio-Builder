import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      message: 'Portfolios retrieved successfully',
      data: [
        { id: 1, title: 'Demo Portfolio 1', description: 'Test portfolio' },
        { id: 2, title: 'Demo Portfolio 2', description: 'Another test' }
      ]
    })
  } catch (error) {
    console.error('Portfolios error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    return NextResponse.json({
      message: 'Portfolio created successfully',
      portfolio: { id: Date.now(), ...body }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    )
  }
}
