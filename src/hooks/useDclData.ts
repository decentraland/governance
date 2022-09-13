import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { DclData } from '../clients/DclData'

function useDclData() {
  return useAsyncMemo(async () => DclData.get().getData())
}

export default useDclData
