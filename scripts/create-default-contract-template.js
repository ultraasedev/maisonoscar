const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const defaultContractTemplate = `CONTRAT DE LOCATION EN COLOCATION MEUBLÉE
=========================================================

MAISON OSCAR - SOLUTION D'HÉBERGEMENT NOUVELLE GÉNÉRATION

Entre les soussignés :

**LE BAILLEUR - MAISON OSCAR**
Société : Maison Oscar SAS
Représentée par : {{OWNER_NAME}}, en qualité de gérant
Adresse du siège social : {{OWNER_ADDRESS}}
Email professionnel : {{OWNER_EMAIL}}
Téléphone : {{OWNER_PHONE}}
SIRET : {{SIRET_NUMBER}}
Activité : Gestion de résidences en coliving et services associés

**LE COLIVEUR (LOCATAIRE)**
Prénom et Nom : {{TENANT_FIRSTNAME}} {{TENANT_LASTNAME}}
Date de naissance : {{TENANT_BIRTHDATE}}
Lieu de naissance : {{TENANT_BIRTHPLACE}}
Nationalité : {{TENANT_NATIONALITY}}
Situation familiale : {{TENANT_MARITAL_STATUS}}
Adresse personnelle : {{TENANT_ADDRESS}}
Email personnel : {{TENANT_EMAIL}}
Téléphone mobile : {{TENANT_PHONE}}
Activité professionnelle : {{TENANT_PROFESSION}}
Revenus nets mensuels : {{TENANT_INCOME}}€
Pièce d'identité n° : {{IDENTITY_NUMBER}}

**AUTRES COLIVEURS PRÉSENTS**
Les coliveurs suivants occupent également la résidence :
• {{ROOMMATE_1_NAME}} - {{ROOMMATE_1_EMAIL}} - {{ROOMMATE_1_PHONE}}
• {{ROOMMATE_2_NAME}} - {{ROOMMATE_2_EMAIL}} - {{ROOMMATE_2_PHONE}}
• {{ROOMMATE_3_NAME}} - {{ROOMMATE_3_EMAIL}} - {{ROOMMATE_3_PHONE}}
• {{ROOMMATE_4_NAME}} - {{ROOMMATE_4_EMAIL}} - {{ROOMMATE_4_PHONE}}
• {{ROOMMATE_5_NAME}} - {{ROOMMATE_5_EMAIL}} - {{ROOMMATE_5_PHONE}}

====================
PRÉAMBULE - PHILOSOPHIE DU COLIVING
====================

Le coliving est un nouveau mode de vie qui favorise le partage d'espaces, d'expériences et de valeurs entre coliveurs.
Ce contrat encadre une location de courte à moyenne durée dans une résidence entièrement aménagée et gérée par Maison Oscar.

Notre mission : offrir une expérience d'hébergement premium alliant confort individuel et vie communautaire enrichissante.
Nos valeurs : respect mutuel, convivialité, durabilité et innovation dans l'habitat partagé.

====================
CLAUSES CONTRACTUELLES
====================

## Article 1 : OBJET ET DESCRIPTION DE LA PRESTATION

**1.1 ESPACE PRIVATIF LOUÉ**
Le bailleur met à disposition du coliveur :
- Chambre privée : {{ROOM_NAME}} (n°{{ROOM_NUMBER}})
- Surface privative : {{ROOM_SURFACE}} m²
- Étage : {{ROOM_FLOOR}}
- Équipements inclus : lit double/simple, bureau ergonomique, armoire spacieuse, éclairage LED, chauffage individuel
- Accès privatif sécurisé : serrure électronique avec badge d'accès NFC
- Fenêtre avec vue : {{ROOM_VIEW}}

**1.2 RÉSIDENCE ET ESPACES COMMUNS**
Adresse de la résidence : {{PROPERTY_ADDRESS}}
Surface totale : {{TOTAL_SURFACE}} m² répartis sur {{TOTAL_ROOMS}} chambres privées
Classification : Résidence de standing avec services hôteliers

Espaces partagés haut de gamme :
• Cuisine moderne entièrement équipée (électroménager Bosch/Siemens, plan de travail quartz, vaisselle et ustensiles fournis)
• Salon/espace détente design avec mobilier contemporain, TV 4K, système audio
• {{BATHROOM_COUNT}} salle(s) de bain premium avec douche à l'italienne
• {{WC_COUNT}} WC séparé(s) avec lave-mains
• Espace extérieur aménagé : {{BALCONY_INFO}}
• Services annexes : {{PARKING_INFO}}
• Buanderie équipée : lave-linge et sèche-linge professionnels
• Espace coworking avec wifi fibre, prises USB, éclairage adapté
• Cave à vélos sécurisée
• Local à poubelles avec tri sélectif

**1.3 SERVICES PREMIUM MAISON OSCAR**
Inclus dans votre loyer tout-compris :

🧹 **Services de ménage et entretien**
- Ménage hebdomadaire professionnel des espaces communs
- Nettoyage approfondi mensuel
- Fourniture permanente des produits d'entretien écologiques
- Entretien et maintenance préventive des équipements

🔧 **Maintenance technique 24/7**
- Hotline technique disponible 7j/7
- Intervention rapide sous 24-48h
- Réparations et remplacements gratuits
- Contrôles de sécurité périodiques

📱 **Services digitaux**
- Application mobile Maison Oscar (accès, communication, services)
- Wifi fibre très haut débit (500 Mbps) dans toute la résidence
- Accès 24h/24 via badges NFC
- Système de réservation d'espaces communs

🏨 **Conciergerie et services**
- Réception de colis et courrier en votre absence
- Service de nettoyage chambre privée (sur demande, payant)
- Assistance administrative et recommandations locales
- Service de linge (sur demande, payant)

🎉 **Animation communautaire**
- Organisation d'événements résidents mensuels
- Apéritifs de bienvenue nouveaux arrivants
- Ateliers thématiques (cuisine, DIY, bien-être)
- Groupes WhatsApp et Discord communautaires

## Article 2 : DURÉE ET RENOUVELLEMENT

**2.1 DURÉE INITIALE**
Contrat de coliving d'une durée de {{CONTRACT_DURATION}} mois
Début de la location : {{START_DATE}} à 14h00 (remise des clés et formation)
Fin de location : {{END_DATE}} à 11h00 (restitution et état des lieux)

**2.2 RENOUVELLEMENT ET FLEXIBILITÉ**
- Renouvellement tacite par périodes de {{RENEWAL_PERIOD}} mois
- Possibilité de négocier des durées différentes selon disponibilités
- Option "nomade" : mobilité entre résidences Maison Oscar du réseau
- Sous-location temporaire autorisée avec accord préalable (vacances, déplacements pro)

**2.3 FLEXIBILITÉ COLIVING UNIQUE**
- Préavis réduit à {{NOTICE_PERIOD}} mois (au lieu de 3 mois classiques)
- Possibilité de départ anticipé pour motifs professionnels ou personnels majeurs
- Option changement de chambre au sein de la même résidence (selon disponibilité)
- Transfert vers autres résidences Maison Oscar en France

## Article 3 : CONDITIONS FINANCIÈRES TRANSPARENTES

**3.1 LOYER MENSUEL TOUT INCLUS - SANS SURPRISE**
**💰 MONTANT TOTAL : {{MONTHLY_RENT}}€ TTC par mois**
*Aucun frais caché, aucune mauvaise surprise !*

Répartition transparente et détaillée :
• **Loyer de base (chambre privée)** : {{BASE_RENT}}€
• **Charges locatives forfaitaires** : {{CHARGES}}€
  - Eau chaude et froide illimitée
  - Électricité et chauffage (éco-responsable)
  - Internet fibre très haut débit
  - Assurance habitation complète de la résidence
• **Services premium Maison Oscar** : {{SERVICE_FEES}}€
  - Ménage professionnel espaces communs
  - Maintenance et réparations toutes garanties
  - Conciergerie et assistance personnalisée
  - Accès application mobile et services digitaux
  - Animation communautaire et événements

**3.2 MODALITÉS DE PAIEMENT SIMPLIFIÉES**
• **Échéance** : le {{PAYMENT_DAY}} de chaque mois (date fixe, prévisible)
• **Mode de paiement** : {{PAYMENT_METHOD}}
• **Prélèvement automatique SEPA** fortement recommandé (sécurisé et sans oubli)
• **Aucun frais de dossier Maison Oscar** (transparence totale)
• **Possibilité de paiement anticipé** avec remise de 2% (paiement trimestriel/semestriel)

**3.3 DÉPÔT DE GARANTIE ÉQUITABLE**
• **Montant** : {{SECURITY_DEPOSIT}}€ (équivalent à 1 mois de loyer maximum légal)
• **Versement** : à la signature du contrat
• **Restitution** : sous 2 mois maximum après état des lieux de sortie conforme
• **Déductions possibles** : uniquement dégâts anormaux, frais de nettoyage excessif, objets manquants

**3.4 RÉVISION ANNUELLE**
Le loyer peut être révisé annuellement selon l'indice de référence des loyers (IRL) publié par l'INSEE.

## Article 4 : ÉTAT DES LIEUX ET INVENTAIRE COMPLET

**4.1 ENTRÉE DANS LES LIEUX - ACCUEIL PREMIUM**
• **État des lieux contradictoire détaillé** le {{INVENTORY_DATE}} en présence du coliveur
• **Inventaire exhaustif** du mobilier, équipements et décoration
• **Photos numériques** de l'état initial (archivage digital)
• **Remise du pack d'accueil** : clés, badges NFC, guides pratiques
• **Formation personnalisée** : équipements, application mobile, règles de vie
• **Visite guidée complète** de la résidence et présentation des services
• **Kit de première nécessité** offert : produits d'hygiène, café/thé de bienvenue

**4.2 SORTIE DES LIEUX - PROCESS TRANSPARENT**
• **État des lieux de sortie** réalisé en présence du coliveur ou de son représentant
• **Comparaison détaillée** avec l'état d'entrée (photos à l'appui)
• **Vérification complète** de l'inventaire et de l'état général
• **Restitution obligatoire** de tous les accès (clés, badges, télécommandes, codes)
• **Nettoyage standard inclus** dans les charges (nettoyage normal d'usage)

## Article 5 : OBLIGATIONS ET DROITS DU COLIVEUR

**5.1 USAGE ET OCCUPATION RESPONSABLE**
Le coliveur s'engage à :
• **Occuper personnellement et paisiblement** la chambre (résidence principale ou secondaire)
• **Utiliser les lieux en bon père de famille** selon leur destination
• **Respecter la vocation résidentielle** des espaces (interdiction activité commerciale)
• **Ne pas transformer ou modifier** les équipements sans autorisation écrite
• **Maintenir une hygiène et une propreté** conformes à la vie en collectivité
• **Signaler immédiatement** tout problème technique, dégât ou dysfonctionnement

**5.2 VIE EN COMMUNAUTÉ HARMONIEUSE**
Principes fondamentaux du vivre-ensemble :
• **Respecter les autres coliveurs** et leurs différences culturelles
• **Maintenir la propreté** des espaces communs après chaque usage
• **Participer positivement** à l'ambiance conviviale de la résidence
• **Respecter les horaires de tranquillité** : 22h-8h en semaine, 23h-9h weekend
• **Adopter un comportement responsable** (bruit, propreté, partage)
• **Participer aux événements communautaires** (fortement encouragé)

**5.3 ASSURANCE ET RESPONSABILITÉ**
• **Souscrire une assurance responsabilité civile** personnelle obligatoire
• **Fournir l'attestation** avant l'entrée dans les lieux et à chaque renouvellement
• **Assurance biens personnels** fortement recommandée (bijoux, électronique, etc.)

## Article 6 : RÈGLEMENT INTÉRIEUR COLIVING DÉTAILLÉ

**6.1 GESTION DES ESPACES COMMUNS**
🍽️ **Cuisine partagée** :
• Nettoyage immédiat obligatoire après chaque utilisation
• Vaisselle lavée et rangée systématiquement
• Respect du planning de grand ménage hebdomadaire
• Étiquetage des produits périssables au réfrigérateur
• Interdiction de monopoliser les équipements (four, plaques) > 2h

🛋️ **Salon et espaces détente** :
• Volume sonore modéré (TV, musique, conversations)
• Remise en ordre après utilisation
• Respect des créneaux de réservation pour événements privés

🚿 **Salles de bain** :
• Nettoyage après usage (cheveux, savon, calcaire)
• Évacuation rapide après utilisation (max 45 min)
• Produits d'hygiène personnels dans sa chambre uniquement

**6.2 POLITIQUE INVITÉS ET VISITEURS**
👥 **Règles d'accueil** :
• **Invités autorisés** : jusqu'à 22h en semaine, 24h le weekend
• **Maximum 2 invités simultanés** par coliveur
• **Responsabilité totale** du coliveur pour ses invités (dégâts, bruit, comportement)
• **Interdiction formelle** de sous-location type Airbnb ou hébergement payant
• **Nuitées exceptionnelles** d'invités : maximum 3 nuits par mois avec accord résidents

**6.3 GESTION DES BIENS PERSONNELS**
📦 **Organisation et stockage** :
• **Étiquetage obligatoire** des produits dans réfrigérateur et placards communs
• **Évacuation automatique** des objets abandonnés après 7 jours (frigo) ou 15 jours (autres espaces)
• **Interdiction absolue** de monopoliser les espaces communs avec des affaires personnelles
• **Casiers personnels** disponibles en supplément sur demande

**6.4 SÉCURITÉ ET ACCÈS HAUTE TECHNOLOGIE**
🔐 **Protocole sécuritaire** :
• **Fermeture systématique** de la résidence (porte principale, portail)
• **Interdiction formelle** de reproduction des clés/badges (sanctions légales)
• **Code d'accès strictement personnel** - ne pas communiquer
• **Déclaration immédiate** de perte/vol d'accès (facturation remplacement : 50€)
• **Vidéosurveillance** espaces communs et entrées (respect RGPD)

## Article 7 : SERVICES MAISON OSCAR DÉTAILLÉS

**7.1 MAINTENANCE TECHNIQUE PROFESSIONNELLE**
🔧 **Garantie intervention rapide** :
• **Urgences** (eau, électricité, chauffage) : intervention sous 4h
• **Réparations standard** : intervention sous 24-48h ouvrées
• **Maintenance préventive** trimestrielle des équipements
• **Remplacement gratuit** du matériel défaillant (hors négligence)
• **Hotline technique** 7j/7 via application mobile
• **Suivi digital** des interventions et historique

**7.2 SERVICES DE CONCIERGERIE PREMIUM**
📋 **Assistance quotidienne** :
• **Réception sécurisée** de tous colis et courrier avec notification
• **Assistance administrative** : démarches, renseignements, traductions
• **Recommandations locales qualifiées** : médecins, dentistes, commerces, restaurants
• **Service courses** d'urgence sur demande (frais au coliveur)
• **Coordination artisans** pour interventions dans votre chambre

**7.3 ÉCOSYSTÈME DIGITAL MAISON OSCAR**
📱 **Application mobile tout-en-un** :
• **Gestion complète des accès** et codes personnalisés
• **Communication instantanée** entre coliveurs (chat, annonces)
• **Signalement facile** d'incidents ou demandes de maintenance
• **Réservation** d'espaces communs pour événements privés
• **Suivi conso** énergétique et conseils éco-responsables
• **Marketplace** interne pour échanges/ventes entre coliveurs
• **Agenda** événements communautaires et ateliers

## Article 8 : RÉSILIATION ET DÉPART

**8.1 RÉSILIATION PAR LE COLIVEUR**
📤 **Procédure simplifiée** :
• **Préavis de {{NOTICE_PERIOD}} mois** par lettre recommandée avec AR
• **Préavis réduit** (1 mois) accordé sous conditions exceptionnelles :
  - Mutation professionnelle avec justificatifs
  - Problèmes de santé majeurs
  - Études à l'étranger
• **Départ anticipé négociable** avec Maison Oscar selon circonstances
• **Possibilité de recherche** d'un coliveur remplaçant pour reprendre le bail

**8.2 RÉSILIATION PAR LE BAILLEUR**
📥 **Motifs et procédure** :
• **Préavis de 3 mois minimum** pour motif légitime et sérieux
• **Résiliation immédiate possible** en cas de :
  - Manquement grave et répété au règlement intérieur
  - Non-paiement après mise en demeure de 8 jours
  - Troubles graves de voisinage ou comportement incompatible
  - Usage non conforme des lieux

**8.3 MODALITÉS DE REMISE EN ÉTAT**
🧹 **Standards de départ** :
• **Évacuation complète** de la chambre et des espaces personnels
• **Nettoyage standard** selon grille fournie à l'entrée
• **Restitution en parfait état** de fonctionnement (hors usure normale)
• **Remise de tous les accès** : clés, badges, télécommandes, codes

## Article 9 : RESPONSABILITÉS ET ASSURANCES COMPLÈTES

**9.1 RESPONSABILITÉ ET GARANTIES DU COLIVEUR**
⚖️ **Couverture obligatoire** :
• **Dégâts dans sa chambre** : responsabilité totale du coliveur
• **Dégâts dans espaces communs** : responsabilité partagée sauf faute identifiée
• **Vols ou dégradations** causés par ses invités : responsabilité totale
• **Troubles de voisinage** : médiation puis sanctions possibles

**9.2 COUVERTURE ASSURANCE COMPLÈTE**
🛡️ **Protection maximale** :
• **Assurance habitation résidence** souscrite par Maison Oscar (incendie, dégâts des eaux, vol)
• **Assurance responsabilité civile** obligatoire pour chaque coliveur
• **Assistance juridique** incluse dans l'assurance Maison Oscar
• **Assurance biens personnels** conseillée pour objets de valeur

## Article 10 : CLAUSE RÉSOLUTOIRE RENFORCÉE

⚠️ **Résiliation automatique** en cas de :
• **Non-paiement du loyer** après mise en demeure restée sans effet 8 jours
• **Non-respect grave et répété** du règlement intérieur après 2 avertissements écrits
• **Troubles persistants** à la vie communautaire après médiation infructueuse
• **Usage commercial** ou contraire à la destination des lieux
• **Sous-location** non autorisée ou hébergement payant

La résiliation entraîne l'expulsion avec préavis réduit à 8 jours et conservation du dépôt de garantie.

## Article 11 : MÉDIATION ET RÉSOLUTION AMIABLE

**11.1 PHILOSOPHIE DE DIALOGUE**
🤝 **Résolution collaborative** :
En cas de différend, les parties s'engagent à privilégier le dialogue et la recherche de solutions win-win.
Médiation gratuite via les services de l'ADIL ou médiateur agréé de notre choix.

**11.2 PROCÉDURE JUDICIAIRE**
⚖️ **En dernier recours** :
À défaut d'accord amiable dans les 30 jours, compétence exclusive du Tribunal Judiciaire de {{TRIBUNAL_CITY}}.
Droit français applicable exclusivement.

## Article 12 : CLAUSES SPÉCIALES COLIVING

**12.1 ENGAGEMENT COMMUNAUTAIRE**
🌟 **Esprit Maison Oscar** :
Le coliveur adhère aux valeurs de respect, partage et convivialité qui font l'ADN de Maison Oscar.
Participation encouragée aux initiatives communautaires et feedback constructif sur l'amélioration des services.

**12.2 ÉVOLUTION DU CONTRAT**
🔄 **Adaptation continue** :
Ce contrat peut évoluer pour s'adapter aux retours coliveurs et innovations Maison Oscar.
Toute modification sera proposée avec préavis de 2 mois et accord écrit des parties.

**12.3 DONNÉES PERSONNELLES**
🔒 **Protection RGPD** :
Maison Oscar s'engage au respect strict du RGPD pour toutes les données personnelles collectées.
Droit d'accès, rectification et suppression garanti selon la réglementation en vigueur.

## Article 13 : SIGNATURES ET ACCEPTATION

Fait à {{CITY}}, le {{CONTRACT_DATE}}
En deux exemplaires originaux, chaque partie reconnaissant avoir reçu le sien.

**POUR MAISON OSCAR SAS**                    **LE COLIVEUR**
Le Gérant

[SIGNATURE:ADMIN_SIGNATURE]                  [SIGNATURE:TENANT_SIGNATURE]

**{{OWNER_NAME}}**                           **{{TENANT_FIRSTNAME}} {{TENANT_LASTNAME}}**
Gérant de Maison Oscar SAS                   Coliveur

**DÉCLARATION DU COLIVEUR :**
"Je reconnais avoir pris connaissance intégrale du présent contrat de coliving, du règlement intérieur détaillé et du guide du coliveur Maison Oscar. J'accepte sans réserve toutes les clauses et m'engage à respecter l'esprit communautaire de la résidence."

Date : {{CONTRACT_DATE}}
Signature du coliveur : [SIGNATURE:TENANT_SIGNATURE]

---

**ANNEXES CONTRACTUELLES OBLIGATOIRES :**
1. Règlement intérieur détaillé (10 pages)
2. État des lieux d'entrée photographique
3. Inventaire exhaustif du mobilier et équipements
4. Guide du coliveur Maison Oscar (services, contacts, bonnes pratiques)
5. Attestation d'assurance habitation de la résidence
6. Notice d'utilisation des équipements et application mobile

**CONTACT MAISON OSCAR :**
📧 Email : contact@maison-oscar.fr
📞 Urgences techniques : +33 1 XX XX XX XX
🌐 Site web : www.maison-oscar.fr
📱 Application : "Maison Oscar" sur App Store et Google Play

*Contrat rédigé conformément à la loi du 6 juillet 1989 et au Code civil français.*
*Version 2.0 - Mise à jour {{CONTRACT_DATE}}*`

async function createDefaultTemplate() {
  try {
    console.log('🚀 Création du template de contrat par défaut...')

    // Trouver un utilisateur admin ou créer un utilisateur système
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
          hashedPassword: 'system-user' // Pas de connexion possible
        }
      })
    }

    console.log('👤 Utilisateur admin trouvé:', adminUser.email)

    // Supprimer tous les anciens templates par défaut
    await prisma.contractTemplate.updateMany({
      where: { isDefault: true },
      data: { isDefault: false }
    })

    // Créer le nouveau template par défaut
    const template = await prisma.contractTemplate.create({
      data: {
        name: 'Contrat Coliving Premium Maison Oscar',
        description: 'Template complet et professionnel pour contrats de coliving avec tous les services Maison Oscar inclus',
        pdfData: defaultContractTemplate,
        isDefault: true,
        createdById: adminUser.id
      }
    })

    console.log('✅ Template par défaut créé avec succès!')
    console.log('📋 ID:', template.id)
    console.log('📝 Nom:', template.name)
    console.log('🌟 Par défaut:', template.isDefault)
    console.log('👤 Créé par:', adminUser.email)

  } catch (error) {
    console.error('❌ Erreur lors de la création du template:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultTemplate()