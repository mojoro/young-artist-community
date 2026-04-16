import { PrismaClient } from '@prisma/client'
import { beforeEach } from 'vitest'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'

export const prisma = mockDeep<PrismaClient>()
export type MockPrisma = DeepMockProxy<PrismaClient>

beforeEach(() => {
  mockReset(prisma)
})
