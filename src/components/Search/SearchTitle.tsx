import React from 'react'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'
import { Back } from 'decentraland-ui/dist/components/Back/Back'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { navigate } from 'gatsby-plugin-intl'
import locations from '../../modules/locations'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { useSearchParams } from '../../hooks/useSearchParams'
import './SearchTitle.css'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

export function SearchTitle() {
  const l = useFormatMessage()
  const responsive = useResponsive()
  const { search } = useSearchParams()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })

  return (
    <>
      {search && isMobile && <hr className={'SearchTitle__Separator'} />}
      {search && (
        <div className={'SearchTitle'}>
          <div className={'SearchTitle__Container'}>
            <div className={'SearchTitle__Container'}>
              <Back onClick={() => navigate(locations.proposals())} />
            </div>
            <div className={'SearchTitle_TextContainer'}>
              <Header className={TokenList.join(['SearchTitle__Text', 'SearchTitle__Ellipsis'])}>
                {l('navigation.search.search_results', { title: search })}
              </Header>
              <Header className={TokenList.join(['SearchTitle__Text', 'SearchTitle__ClosingDoubleQuote'])}>{'"'}</Header>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
