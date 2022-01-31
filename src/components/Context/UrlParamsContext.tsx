import React, {createContext, useState} from 'react';

type UrlParamsContextProviderProps = {
	children: React.ReactNode
}

type UrlParamsContextType = {
  params: UrlParams | null
  setParams: React.Dispatch<React.SetStateAction<UrlParams | null>>
}

export type UrlParams = {
  params: string
  itemsPerPage: number
}

export const UrlParamsContext = createContext<UrlParamsContextType | null>(null)

const UrlParamsContextProvider = ({children}: UrlParamsContextProviderProps) => {
  const [params, setParams] = useState<UrlParams | null>(null);
	return <UrlParamsContext.Provider value={{params, setParams}}>{children}</UrlParamsContext.Provider>
}

export default UrlParamsContextProvider