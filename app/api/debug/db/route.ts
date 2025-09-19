import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb_uri_exists: !!process.env.MONGODB_URI,
    mongodb_uri_preview: process.env.MONGODB_URI ?
      `${process.env.MONGODB_URI.substring(0, 20)}...${process.env.MONGODB_URI.slice(-10)}` :
      'NOT_SET',
    connection_test: null as any,
    rooms_test: null as any
  }

  // Test de connexion Prisma
  try {
    await prisma.$connect()
    debug.connection_test = { success: true, message: 'Connected to Prisma' }
  } catch (error: any) {
    debug.connection_test = {
      success: false,
      error: error.message,
      type: error.constructor.name
    }
  }

  // Test de requête rooms
  try {
    const rooms = await prisma.room.findMany({ take: 1 })
    debug.rooms_test = {
      success: true,
      count: rooms.length,
      message: 'Rooms query successful'
    }
  } catch (error: any) {
    debug.rooms_test = {
      success: false,
      error: error.message,
      type: error.constructor.name
    }
  }

  return NextResponse.json(debug, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}