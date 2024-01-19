import { useQuery } from '@tanstack/react-query'

import { ONE_MINUTE_MS } from './constants'

const MANA_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=decentraland&vs_currencies=usd'
type ManaPrice = {
  decentraland: {
    usd: number
  }
}

function useManaPrice() {
  const { data } = useQuery<ManaPrice>({
    queryKey: ['mana-price'],
    queryFn: () => fetch(MANA_PRICE_URL).then((res) => res.json()),
    staleTime: ONE_MINUTE_MS,
  })

  return data?.decentraland.usd
}

export default useManaPrice
