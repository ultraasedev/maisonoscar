# Maison Oscar - Agent Development Guide

## Build & Development Commands
```bash
npm run dev          # Start Next.js development server
npm run build        # Production build with TypeScript strict mode
npm run lint         # Run Next.js linter
npm run db:push      # Push Prisma schema to MongoDB
npm run db:generate  # Generate Prisma client types
npm test            # Run tests (to be implemented)
```

## Code Style Requirements
- **TypeScript**: Strict mode enabled, NO 'any' types allowed
- **Imports**: Use absolute imports with '@/' prefix (e.g., `import { prisma } from '@/lib/prisma'`)
- **Components**: Mobile-first development (320px base), use 'use client' directive for client components
- **Styling**: Tailwind CSS v4 only, NO custom CSS. Breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px
- **API Routes**: Zod validation required, return `NextResponse.json({ success: boolean, data?: any, error?: string })`
- **Error Handling**: Try-catch blocks in all API routes, toast notifications for UI errors
- **File Headers**: Optional descriptive comments at file start (e.g., `// Fichier : path/to/file.ts`)
- **Naming**: PascalCase for components, camelCase for functions/variables, SCREAMING_SNAKE_CASE for constants
- **Database**: Use Prisma types from '@prisma/client', always include error handling for DB operations
- **Images**: Always use next/image for optimization, store in public/ directory
- **Forms**: React Hook Form + Zod validation, real-time validation feedback
- **Animations**: Framer Motion for all animations (initial, animate, transition props)
- **State**: Prefer server components, use 'use client' only when needed for interactivity
- **Performance**: Dynamic imports for admin sections, maintain 90+ Lighthouse scores
- **Security**: Never commit secrets, use environment variables, implement proper auth checks
- **Testing**: Verify mobile layouts first, test all breakpoints, handle edge cases
- **Colors**: Black #000000, Beige #F5F3F0 as primary brand colors