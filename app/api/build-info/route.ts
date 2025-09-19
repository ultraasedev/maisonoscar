import { NextResponse } from 'next/server'

export async function GET() {
  const buildInfo = {
    timestamp: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'd8fa824',
    deploymentUrl: process.env.VERCEL_URL || 'local',
    environment: process.env.NODE_ENV || 'development',
    version: '2025-09-19-api-fixes',
    features: [
      'Room count API with DB fallback',
      'PostCSS Tailwind v4 configuration',
      'Vercel pnpm build optimization',
      'Environment variables configured'
    ]
  }

  return NextResponse.json(buildInfo)
}