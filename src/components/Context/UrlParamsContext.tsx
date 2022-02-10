import React, {createContext, useState, useEffect} from 'react';
import { ProposalListPage, ProposalListViewFilter, ProposalsModal, ProposalsStatusFilter, ProposalsTypeFilter } from '../../modules/locations';

type UrlParamsContextProviderProps = {
	children: React.ReactNode
}

type UrlParamsContextType = {
  params: Partial<ProposalListPage & ProposalListViewFilter & ProposalsStatusFilter & ProposalsTypeFilter & ProposalsModal> |  null
  setUrlParams: React.Dispatch<React.SetStateAction<string | null>>
}

export const UrlParamsContext = createContext<UrlParamsContextType | null>(null)

const UrlParamsContextProvider = ({children}: UrlParamsContextProviderProps) => {
  const [urlParams, setUrlParams] = useState<string | null>(null);
  const [params, setParams] = useState<Partial<ProposalListPage & ProposalListViewFilter & ProposalsStatusFilter & ProposalsTypeFilter & ProposalsModal> |  null>(null)

  useEffect(() => {
    if(urlParams) {
      const paramsSearch = new URLSearchParams(urlParams)
      const filters: any = {}

      for (const key of paramsSearch.keys()) {
        filters[key] = paramsSearch.get(key)
      }
      setParams(filters)
    }
  }, [urlParams])

	return <UrlParamsContext.Provider value={{params, setUrlParams}}>{children}</UrlParamsContext.Provider>
}

export default UrlParamsContextProvider