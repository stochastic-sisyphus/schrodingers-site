import { NextResponse } from 'next/server'

export async function GET() {
  const rssUrl = process.env.SUBSTACK_RSS_URL

  if (!rssUrl) {
    return NextResponse.json({ error: 'RSS URL not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(rssUrl)

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch RSS' }, { status: response.status })
    }

    const text = await response.text()
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch (error) {
    console.error('Substack RSS fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch RSS' }, { status: 500 })
  }
}
