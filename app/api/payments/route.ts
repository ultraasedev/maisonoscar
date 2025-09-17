import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (type && type !== 'ALL') {
      where.paymentType = type
    }

    if (search) {
      where.OR = [
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ]
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        booking: {
          include: {
            room: {
              select: {
                id: true,
                name: true,
                number: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    // Vérifier et mettre à jour les statuts des paiements en retard
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const paymentsToUpdate = payments.filter(payment => {
      const dueDate = new Date(payment.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return payment.status === 'PENDING' && dueDate < today
    })

    if (paymentsToUpdate.length > 0) {
      await prisma.payment.updateMany({
        where: {
          id: {
            in: paymentsToUpdate.map(p => p.id)
          }
        },
        data: {
          status: 'LATE'
        }
      })

      // Récupérer les paiements mis à jour
      const updatedPayments = await prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          booking: {
            include: {
              room: {
                select: {
                  id: true,
                  name: true,
                  number: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: {
          dueDate: 'asc'
        }
      })

      return NextResponse.json({ success: true, data: updatedPayments })
    }

    return NextResponse.json({ success: true, data: payments })
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des paiements' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { bookingId, userId, amount, paymentType, dueDate } = body

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount,
        paymentType,
        dueDate: new Date(dueDate),
        status: 'PENDING'
      },
      include: {
        user: true,
        booking: {
          include: {
            room: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, status } = body

    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (status === 'PAID') {
      updateData.paidDate = new Date()
      updateData.isLate = false
      updateData.lateDays = 0
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        booking: {
          include: {
            room: true
          }
        }
      }
    })

    // TODO: Envoyer la quittance par email si le paiement est validé

    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paiement:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du paiement' },
      { status: 500 }
    )
  }
}