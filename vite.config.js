import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 루트의 assets/ 는 원본 보관 폴더라 Vite의 public 폴더로 쓰지 않습니다.
  publicDir: 'public',
})
