import dotenv from 'dotenv'
import { defineConfig, env } from 'prisma/config'

dotenv.config({ path: '.env.local' })
dotenv.config()

type Env = {
  DATABASE_URL: string
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env<Env>('DATABASE_URL'),
  },
})
