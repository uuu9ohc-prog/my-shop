import LoadingScreen from '../components/LoadingScreen.jsx'
import { YarnPile } from '../components/YarnArt.jsx'

// P0 시작 로딩 → 끝나면 P1
export default function P0Intro() {
  return (
    <LoadingScreen
      art={<YarnPile />}
      imageLabel="털실이 소복이 쌓이는 이미지"
      message="털실을 한 타래씩 모으고 있어요"
      to="/home"
    />
  )
}
