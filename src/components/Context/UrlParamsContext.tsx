import React, {createContext, useState} from 'react';

type UrlParamsContextProviderProps = {
	children: React.ReactNode
}

type UrlParamsContextType = {
  urlParams: string | null
  setUrlParams: React.Dispatch<React.SetStateAction<string | null>>
}

export const UrlParamsContext = createContext<UrlParamsContextType | null>(null)

const UrlParamsContextProvider = ({children}: UrlParamsContextProviderProps) => {
  const [urlParams, setUrlParams] = useState<string | null>(null);
	return <UrlParamsContext.Provider value={{urlParams, setUrlParams}}>{children}</UrlParamsContext.Provider>
}

export default UrlParamsContextProvider