import React, {createContext, useState} from 'react';

type UrlParamsContextProviderProps = {
	children: React.ReactNode
}

type UrlParamsContextType = {
  urlParams: UrlParams | null
  setUrlParams: React.Dispatch<React.SetStateAction<UrlParams | null>>
}

export type UrlParams = {
  params: string
  itemsPerPage: number
}

export const UrlParamsContext = createContext<UrlParamsContextType | null>(null)

const UrlParamsContextProvider = ({children}: UrlParamsContextProviderProps) => {
  const [urlParams, setUrlParams] = useState<UrlParams | null>(null);
	return <UrlParamsContext.Provider value={{urlParams, setUrlParams}}>{children}</UrlParamsContext.Provider>
}

export default UrlParamsContextProvider