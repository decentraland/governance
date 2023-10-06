import classNames from 'classnames'
import { Back } from 'decentraland-ui/dist/components/Back/Back'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import useFormatMessage from '../../hooks/useFormatMessage'
import { useProposalsSearchParams } from '../../hooks/useProposalsSearchParams'
import locations, { navigate } from '../../utils/locations'

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
