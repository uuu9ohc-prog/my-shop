import { Navigate } from 'react-router-dom'
import { getMissing, useOrder } from '../state/OrderContext.jsx'

// P4~P7 은 커스텀을 모두 마쳐야 볼 수 있음. 아니면 알맞은 단계로 돌려보냄.
export default function RequireComplete({ children }) {
  const { order } = useOrder()
  if (!order.designId) return <Navigate to="/designs" replace />
  if (getMissing(order).length > 0) return <Navigate to={`/custom/${order.designId}`} replace />
  return children
}
