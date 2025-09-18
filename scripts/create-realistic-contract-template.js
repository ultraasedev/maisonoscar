const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const realisticContractTemplate = `CONTRAT DE LOCATION EN COLOCATION MEUBLÉE
==============================================

**MAISON OSCAR**
Gestion immobilière et services de colocation

Entre les soussignés :

**LE BAILLEUR**
Société : Maison Oscar
Représentée par : {{OWNER_NAME}}, en qualité de gérant
Adresse du siège social : {{OWNER_ADDRESS}}
Email : {{OWNER_EMAIL}}
Téléphone : {{OWNER_PHONE}}
SIRET : {{SIRET_NUMBER}}

**LE LOCATAIRE**
Nom et prénom : {{TENANT_FIRSTNAME}} {{TENANT_LASTNAME}}
Date de naissance : {{TENANT_BIRTHDATE}}
Lieu de naissance : {{TENANT_BIRTHPLACE}}
Nationalité : {{TENANT_NATIONALITY}}
Situation familiale : {{TENANT_MARITAL_STATUS}}
Adresse personnelle : {{TENANT_ADDRESS}}
Email : {{TENANT_EMAIL}}
Téléphone : {{TENANT_PHONE}}
Profession : {{TENANT_PROFESSION}}
Revenus mensuels nets : {{TENANT_INCOME}}€
Pièce d'identité n° : {{IDENTITY_NUMBER}}

**AUTRES COLOCATAIRES OCCUPANT LE LOGEMENT**
• {{ROOMMATE_1_NAME}} - {{ROOMMATE_1_EMAIL}} - {{ROOMMATE_1_PHONE}}
• {{ROOMMATE_2_NAME}} - {{ROOMMATE_2_EMAIL}} - {{ROOMMATE_2_PHONE}}
• {{ROOMMATE_3_NAME}} - {{ROOMMATE_3_EMAIL}} - {{ROOMMATE_3_PHONE}}
• {{ROOMMATE_4_NAME}} - {{ROOMMATE_4_EMAIL}} - {{ROOMMATE_4_PHONE}}
• {{ROOMMATE_5_NAME}} - {{ROOMMATE_5_EMAIL}} - {{ROOMMATE_5_PHONE}}

IL A ÉTÉ CONVENU CE QUI SUIT :

## ARTICLE 1 : OBJET ET DÉSIGNATION DU LOGEMENT

**1.1 Objet du contrat**
Le bailleur loue au locataire, qui accepte, un logement meublé situé :

**Adresse** : {{PROPERTY_ADDRESS}}
**Chambre** : {{ROOM_NAME}} (n°{{ROOM_NUMBER}})
**Surface privative** : {{ROOM_SURFACE}} m²
**Étage** : {{ROOM_FLOOR}}
**Surface totale du logement** : {{TOTAL_SURFACE}} m²
**Nombre total de chambres** : {{TOTAL_ROOMS}}

**1.2 Espaces privatifs**
- Chambre meublée avec : lit, bureau, armoire, chaise
- Accès exclusif avec serrure individuelle

**1.3 Espaces communs à partager**
- Cuisine équipée (réfrigérateur, plaques, four, micro-ondes, vaisselle)
- Salon meublé
- {{BATHROOM_COUNT}} salle(s) de bain
- {{WC_COUNT}} WC
- {{BALCONY_INFO}}
- {{PARKING_INFO}}
- Buanderie avec lave-linge

## ARTICLE 2 : DURÉE DU BAIL

**Durée** : {{CONTRACT_DURATION}} mois
**Date de prise d'effet** : {{START_DATE}} à 14h00
**Date de fin** : {{END_DATE}} à 11h00

Le bail se renouvellera tacitement par périodes de {{RENEWAL_PERIOD}} mois, sauf préavis donné par l'une des parties.

## ARTICLE 3 : LOYER ET CHARGES

**3.1 Montant du loyer**
**Loyer mensuel charges comprises : {{MONTHLY_RENT}}€**

Détail :
- Loyer hors charges : {{BASE_RENT}}€
- Provision sur charges : {{CHARGES}}€

**3.2 Charges comprises dans la provision**
- Eau froide et chaude
- Électricité et chauffage
- Internet
- Entretien des parties communes
- Assurance habitation du logement

**3.3 Modalités de paiement**
- Paiement mensuel le {{PAYMENT_DAY}} de chaque mois
- Mode de paiement : {{PAYMENT_METHOD}}
- Aucun frais de gestion

## ARTICLE 4 : DÉPÔT DE GARANTIE

Un dépôt de garantie de {{SECURITY_DEPOSIT}}€ est versé à la signature du présent contrat.

Il sera restitué dans un délai maximum de 2 mois après la restitution des clés, déduction faite, le cas échéant, des sommes restant dues et du coût des réparations locatives et remises en état qui seraient nécessaires.

## ARTICLE 5 : ÉTAT DES LIEUX

**5.1 État des lieux d'entrée**
Un état des lieux contradictoire sera établi le {{INVENTORY_DATE}} en présence du locataire.

**5.2 État des lieux de sortie**
Un état des lieux de sortie sera établi contradictoirement lors de la restitution des clés.

## ARTICLE 6 : OBLIGATIONS DU LOCATAIRE

**6.1 Usage du logement**
- Occuper personnellement le logement
- Utiliser paisiblement les lieux selon leur destination
- Entretenir le logement en bon état
- Ne pas apporter de modifications sans accord écrit du bailleur

**6.2 Respect de la vie en colocation**
- Respecter les autres colocataires
- Maintenir la propreté des espaces communs après usage
- Respecter les horaires de tranquillité (22h-8h)
- Ne pas faire de bruit excessif

**6.3 Entretien et réparations**
- Effectuer les menues réparations et l'entretien courant
- Signaler immédiatement les réparations nécessaires
- Permettre l'accès au logement pour les réparations urgentes

## ARTICLE 7 : RÈGLEMENT INTÉRIEUR

**7.1 Espaces communs**
- Nettoyage immédiat après utilisation de la cuisine
- Vaisselle lavée et rangée après usage
- Étiquetage des produits au réfrigérateur
- Respect du planning de ménage

**7.2 Invités**
- Invités autorisés avec modération
- Responsabilité du locataire pour ses invités
- Interdiction de sous-location ou hébergement payant

**7.3 Sécurité**
- Fermeture systématique du logement
- Ne pas donner les codes d'accès à des tiers
- Signaler immédiatement toute perte de clés

## ARTICLE 8 : ASSURANCE

Le locataire doit souscrire une assurance responsabilité civile et fournir l'attestation avant l'entrée dans les lieux et à chaque renouvellement.

## ARTICLE 9 : RÉSILIATION

**9.1 Par le locataire**
Préavis de {{NOTICE_PERIOD}} mois par lettre recommandée avec accusé de réception.

**9.2 Par le bailleur**
Préavis de 3 mois, sauf motifs légitimes et sérieux.

## ARTICLE 10 : CLAUSE RÉSOLUTOIRE

En cas de non-paiement du loyer ou des charges, de non-versement du dépôt de garantie, ou de non-respect des obligations du locataire, le bail sera résilié de plein droit, après commandement demeuré infructueux pendant 8 jours.

## ARTICLE 11 : CONTACT ET GESTION

**Service client Maison Oscar :**
Email : {{CONTACT_EMAIL}}
Téléphone : {{CONTACT_PHONE}}
Urgences : {{EMERGENCY_PHONE}}
Site web : {{WEBSITE_URL}}

Pour toute demande de maintenance ou problème technique, contacter le service client.

## ARTICLE 12 : JURIDICTION

En cas de litige, compétence est donnée aux tribunaux de {{TRIBUNAL_CITY}}.

## ARTICLE 13 : SIGNATURES

Fait à {{CITY}}, le {{CONTRACT_DATE}}
En deux exemplaires originaux

**Le Bailleur**                    **Le Locataire**
Maison Oscar

[SIGNATURE:ADMIN_SIGNATURE]        [SIGNATURE:TENANT_SIGNATURE]

{{OWNER_NAME}}                     {{TENANT_FIRSTNAME}} {{TENANT_LASTNAME}}
Gérant                            Locataire

"Je reconnais avoir reçu un exemplaire du présent contrat et de l'état des lieux."

Signature du locataire : [SIGNATURE:TENANT_SIGNATURE]

---

**ANNEXES :**
- État des lieux d'entrée
- Inventaire du mobilier
- Règlement intérieur complet
- Attestations d'assurance`

async function createRealisticTemplate() {
  try {
    console.log('🚀 Création du template de contrat réaliste...')

    // Trouver un utilisateur admin
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('👤 Création d\'un utilisateur admin système...')
      adminUser = await prisma.user.create({
        data: {
          email: 'system@maison-oscar.fr',
          firstName: 'Système',
          lastName: 'Maison Oscar',
          role: 'ADMIN',
          status: 'ACTIVE',
          hashedPassword: 'system-user'
        }
      })
    }

    // Supprimer tous les anciens templates par défaut
    await prisma.contractTemplate.updateMany({
      where: { isDefault: true },
      data: { isDefault: false }
    })

    // Créer le nouveau template réaliste par défaut
    const template = await prisma.contractTemplate.create({
      data: {
        name: 'Contrat de Colocation Maison Oscar',
        description: 'Contrat de location meublée en colocation conforme à la réglementation française',
        pdfData: realisticContractTemplate,
        isDefault: true,
        createdById: adminUser.id
      }
    })

    console.log('✅ Template réaliste créé avec succès!')
    console.log('📋 ID:', template.id)
    console.log('📝 Nom:', template.name)
    console.log('🌟 Par défaut:', template.isDefault)

  } catch (error) {
    console.error('❌ Erreur lors de la création du template:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRealisticTemplate()