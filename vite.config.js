import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 프로젝트 사이트 주소(https://<user>.github.io/my-shop/)에 맞춘 경로
  base: '/my-shop/',
  // 루트의 assets/ 는 원본 보관 폴더라 Vite의 public 폴더로 쓰지 않습니다.
  publicDir: 'public',
})
