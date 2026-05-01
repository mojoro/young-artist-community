import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const raw = process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL
  if (!raw) {
    throw new Error('POSTGRES_PRISMA_URL (or DATABASE_URL) is not set')
  }
  const connectionString = raw.includes('uselibpqcompat=')
    ? raw
    : raw + (raw.includes('?') ? '&' : '?') + 'uselibpqcompat=true'
  const adapter = new PrismaPg({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
