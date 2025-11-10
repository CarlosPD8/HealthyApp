// cypress.config.js (ESM)
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    // busca en /tests/system con extensiones .cy.js/.jsx/.ts/.tsx
    specPattern: 'tests/system/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
    video: false,
  },
})
