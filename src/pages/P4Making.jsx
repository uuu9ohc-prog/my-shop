import LoadingScreen from '../components/LoadingScreen.jsx'
import { YarnPull } from '../components/YarnArt.jsx'
import { getYarn } from '../data/options.js'
import { useOrder } from '../state/OrderContext.jsx'

// P4 완성 로딩 → 끝나면 P5
// 뽑히는 털실 색 = 고른 전체 바탕 색
export default function P4Making() {
  const { order } = useOrder()
  const yarn = getYarn(order.yarnId)

  return (
    <LoadingScreen
      art={<YarnPull colorId={order.colors[0]} />}
      imageLabel={`고른 털실(${yarn?.name})이 뽑히는 이미지`}
      message="고른 털실을 뽑아 인형을 뜨고 있어요"
      to="/result"
    />
  )
}
