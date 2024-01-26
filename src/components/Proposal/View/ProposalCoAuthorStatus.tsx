import { useEffect, useState } from 'react'

import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { Governance } from '../../../clients/Governance'
import { CoauthorStatus } from '../../../entities/Coauthor/types'
import { isCoauthoringUpdatable } from '../../../entities/Coauthor/utils'
import useCoauthors from '../../../hooks/useCoauthors'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Helper from '../../Helper/Helper'
import Cancel from '../../Icon/Cancel'
import Check from '../../Icon/Check'

import './ProposalCoAuthorStatus.css'

interface Props {
  proposalId: string
  proposalFinishDate: Date
}

interface CoauthorLabelConfiguration {
  title: string
  description: string
  icon?: JSX.Element
}

const labelConfig: Record<CoauthorStatus, CoauthorLabelConfiguration> = {
  [CoauthorStatus.PENDING]: {
    title: 'page.coauthor_detail.pending_label',
    description: 'page.coauthor_detail.pending_description',
  },
  [CoauthorStatus.APPROVED]: {
    title: 'page.coauthor_detail.accepted_label',
    description: 'page.coauthor_detail.accepted_description',
    icon: <Check size={9} />,
  },
  [CoauthorStatus.REJECTED]: {
    title: 'page.coauthor_detail.rejected_label',
    description: 'page.coauthor_detail.rejected_description',
    icon: <Cancel size="9px" />,
  },
}

function ProposalCoAuthorStatus({ proposalId, proposalFinishDate }: Props) {
  const [user] = useAuthContext()
  const isUpdatable = isCoauthoringUpdatable(proposalFinishDate)

  const coAuthors = useCoauthors(proposalId)

  const [status, setStatus] = useState<CoauthorStatus | undefined>(undefined)

  useEffect(() => {
    if (user && coAuthors) {
      setStatus(coAuthors.find((coauthor) => coauthor.address.toLowerCase() === user.toLowerCase())?.status)
    }
  }, [user, coAuthors])

  const t = useFormatMessage()

  const updateStatus = async (status: CoauthorStatus) => {
    try {
      await Governance.get().updateCoauthorStatus(proposalId, status)
      location.reload()
    } catch (error) {
      console.error(error)
    }
  }

  const isPending = status === CoauthorStatus.PENDING
  const pendingClassName = isPending ? 'Pending' : ''
  const revertAction = async (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault()
    if (!status || status === CoauthorStatus.PENDING) {
      return
    }
    if (status === CoauthorStatus.APPROVED) {
      await updateStatus(CoauthorStatus.REJECTED)
    } else {
      await updateStatus(CoauthorStatus.APPROVED)
    }
  }

  return (
    <>
      {status && (
        <div className={classNames('CoAuthorStatus DetailsSection', pendingClassName)}>
          <div className="DetailsSection__Content">
            <span className={classNames('Title', pendingClassName)}>
              <Header sub>{t(labelConfig[status].title)}</Header>
              {isPending ? (
                <Helper text={t('page.coauthor_detail.pending_helper')} position="top center" size="14" />
              ) : (
                labelConfig[status].icon
              )}
            </span>
            <p>
              {t(labelConfig[status].description)}{' '}
              {status !== CoauthorStatus.PENDING && isUpdatable && (
                <span className="CoAuthorStatus__RevertButton" role="button" onClick={revertAction}>
                  {t('page.coauthor_detail.revert_label')}
                </span>
              )}
            </p>
            {isPending && (
              <div className="DetailsSection__Actions">
                <Grid columns="equal">
                  <Grid.Row>
                    <Grid.Column>
                      <Button primary size="small" onClick={() => updateStatus(CoauthorStatus.APPROVED)}>
                        {t('page.coauthor_detail.confirm_label')}
                      </Button>
                    </Grid.Column>
                    <Grid.Column>
                      <Button inverted size="small" onClick={() => updateStatus(CoauthorStatus.REJECTED)}>
                        {t('page.coauthor_detail.deny_label')}
                      </Button>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ProposalCoAuthorStatus
