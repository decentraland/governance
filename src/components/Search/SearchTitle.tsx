import classNames from 'classnames'
import { Back } from 'decentraland-ui/dist/components/Back/Back'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import useFormatMessage from '../../hooks/useFormatMessage'
import { useProposalsSearchParams } from '../../hooks/useProposalsSearchParams'
import locations, { navigate } from '../../utils/locations'

import './SearchTitle.css'

export default function SearchTitle() {
  const t = useFormatMessage()
  const { search } = useProposalsSearchParams()

  if (!search) {
    return null
  }

  return (
    <div className="SearchTitle__Container">
      <NotMobile>
        <div className="SearchTitle__BackContainer">
          <Back className="SearchTitle__Back" onClick={() => navigate(locations.proposals())} />
        </div>
      </NotMobile>
      <div className="SearchTitle__TextContainer">
        <Header className={classNames('SearchTitle__Text', 'SearchTitle__Ellipsis')}>
          {t('navigation.search.search_results', { title: search })}
        </Header>
        <Header className={classNames('SearchTitle__Text', 'SearchTitle__ClosingDoubleQuote')}>{'"'}</Header>
      </div>
    </div>
  )
}
