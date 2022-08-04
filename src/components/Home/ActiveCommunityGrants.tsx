import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import useGrants from '../../hooks/useGrants'
import locations from '../../modules/locations'
import FullWidthButton from '../Common/FullWidthButton'
import GrantCard from '../Grants/GrantCard/GrantCard'

import './ActiveCommunityGrants.css'
import HomeSectionHeader from './HomeSectionHeader'

const CURRENT_GRANTS_PER_PAGE = 4

const ActiveCommunityGrants = () => {
  const t = useFormatMessage()
  const { grants, isLoadingGrants } = useGrants()

  return (
    <>
      <Container>
        <div>
          <HomeSectionHeader
            title={t('page.home.active_community_grants.title')}
            description={t('page.home.active_community_grants.description')}
          />
          <Loader active={isLoadingGrants} />
          {!isLoadingGrants && (
            <div className="ActiveCommunityGrants__Container">
              {grants.current?.slice(0, CURRENT_GRANTS_PER_PAGE).map((grant) => (
                <div className="HoverableCardContainer" key={`HoverableCard__${grant.id}`}>
                  <div className="HoverableCardContainer__Content">
                    <GrantCard grant={grant} hoverable={true} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {!isLoadingGrants && (
          <FullWidthButton link={locations.grants()}>
            {t('page.home.active_community_grants.view_all_grants')}
          </FullWidthButton>
        )}
      </Container>
    </>
  )
}

export default ActiveCommunityGrants
