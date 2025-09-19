import { defineConfig } from 'prisma/config'

export default defineConfig({
  migrations: {
    // seed command movido do package.json
    seed: 'tsx ./prisma/seed.ts',
  },
  schema: './prisma/schema.prisma',
})
