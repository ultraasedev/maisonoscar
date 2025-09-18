import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const signContractSchema = z.object({
  contractId: z.string(),
  signatureDataUrl: z.string().startsWith('data:image/png;base64,'),
  signerName: z.string(),
  signerEmail: z.string().email(),
  signerRole: z.enum(['TENANT', 'GUARANTOR', 'LANDLORD'])
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signContractSchema.parse(body);

    // Vérifier que le contrat existe
    const contract = await prisma.contract.findUnique({
      where: { id: validatedData.contractId }
    });

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contrat introuvable' },
        { status: 404 }
      );
    }

    // Enregistrer la signature dans la base de données
    const signature = await prisma.contractSignature.create({
      data: {
        contractId: validatedData.contractId,
        signerName: validatedData.signerName,
        signerEmail: validatedData.signerEmail,
        signerRole: validatedData.signerRole,
        signatureData: validatedData.signatureDataUrl,
        signedAt: new Date(),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      }
    });

    // Vérifier si toutes les signatures requises sont obtenues
    const signatures = await prisma.contractSignature.findMany({
      where: { contractId: validatedData.contractId }
    });

    const hasTenantSignature = signatures.some((s: any) => s.signerRole === 'TENANT');
    const hasLandlordSignature = signatures.some((s: any) => s.signerRole === 'LANDLORD');
    
    // Si toutes les parties ont signé, mettre à jour le statut du contrat
    if (hasTenantSignature && hasLandlordSignature) {
      await prisma.contract.update({
        where: { id: validatedData.contractId },
        data: {
          status: 'SIGNED',
          signedAt: new Date()
        }
      });

      // Notifier les admins que le contrat a été entièrement signé
      try {
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' }
        });

        const { sendEmail } = await import('@/lib/email');

        for (const admin of admins) {
          await sendEmail(
            admin.email,
            '✅ Contrat signé - Maison Oscar',
            `
            <h2>🎉 Contrat entièrement signé !</h2>
            <p>Bonjour,</p>
            <p>Le contrat <strong>${validatedData.contractId}</strong> a été signé par toutes les parties.</p>

            <p><strong>Signataire :</strong> ${validatedData.signerName} (${validatedData.signerEmail})</p>
            <p><strong>Date de signature :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/admin/contracts"
                 style="background: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                📋 Voir les contrats
              </a>
            </div>

            <p>Vous pouvez maintenant procéder aux prochaines étapes (dépôt de garantie, état des lieux, etc.)</p>

            <p>Cordialement,<br>Système Maison Oscar</p>
            `
          );
        }
      } catch (error) {
        console.error('Erreur notification admins signature:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        signature,
        contractFullySigned: hasTenantSignature && hasLandlordSignature
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la signature:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la signature du contrat' },
      { status: 500 }
    );
  }
}