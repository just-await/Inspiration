import { defineConfig } from 'vite'

export default defineConfig({
  // Точка означает "искать файлы рядом", а не в корне диска
  // Это критически важно для GitHub Pages!
  base: './', 
})