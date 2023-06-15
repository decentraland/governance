import React from 'react'

import classNames from 'classnames'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Back } from 'decentraland-ui/dist/components/Back/Back'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { useProposalsSearchParams } from '../../hooks/useSearchParams'
import locations from '../../utils/locations'

import './SearchTitle.css'

export function SearchTitle() {
  const t = useFormatMessage()
  const { search } = useProposalsSearchParams()
  const isMobile = useMobileMediaQuery()

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
              <Header className={classNames('SearchTitle__Text', 'SearchTitle__Ellipsis')}>
                {t('navigation.search.search_results', { title: search })}
              </Header>
              <Header className={classNames('SearchTitle__Text', 'SearchTitle__ClosingDoubleQuote')}>{'"'}</Header>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
