import React, { useEffect, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button, Header } from 'decentraland-ui'

import { Governance } from '../../api/Governance'
import { CoauthorAttributes, CoauthorStatus } from '../../entities/Coauthor/types'

interface Props {
  proposalId: string
}

interface LabelKey {
  title: string
  description: string
  helper?: string
}

const labelKeys: Record<CoauthorStatus, LabelKey> = {
  [CoauthorStatus.PENDING]: {
    title: 'page.coauthor_detail.pending_label',
    description: 'page.coauthor_detail.pending_description',
    helper: 'page.coauthor_detail.pending_helper',
  },
  [CoauthorStatus.APPROVED]: {
    title: 'page.coauthor_detail.accepted_label',
    description: 'page.coauthor_detail.accepted_description',
  },
  [CoauthorStatus.REJECTED]: {
    title: 'page.coauthor_detail.rejected_label',
    description: 'page.coauthor_detail.rejected_description',
  },
}

function ProposalCoAuthorStatus({ proposalId }: Props) {
  const [user] = useAuthContext()

  const [coAuthors] = useAsyncMemo(() => Governance.get().getCoAuthorsByProposal(proposalId), [], {
    initialValue: [] as CoauthorAttributes[],
  })

  const [status, setStatus] = useState<CoauthorStatus | undefined>(undefined)

  useEffect(() => {
    if (user) {
      setStatus(coAuthors.find((ca) => ca.coauthor_address.toLowerCase() === user.toLowerCase())?.status)
    }
  }, [user, coAuthors])

  const t = useFormatMessage()

  const onClick = async (status: CoauthorStatus) => {
    await Governance.get().updateCoauthorStatus(proposalId, status)
    location.reload()
  }

  return (
    <>
      {status && (
        <div className="CoAuthorStatus DetailsSection">
          <div className="DetailsSection__Content">
            <span className={TokenList.join(['Title', status === CoauthorStatus.PENDING && 'Pending'])}>
              <Header>{t(labelKeys[status].title)}</Header>
              {/*AGREGAR HELPER*/}
            </span>
            <p>{t(labelKeys[status].description)}</p>
            {status === CoauthorStatus.PENDING && (
              <div className="DetailsSection__Actions">
                <Button primary size="small" onClick={() => onClick(CoauthorStatus.APPROVED)}>
                  {t('page.coauthor_detail.confirm_label')}
                </Button>
                <Button inverted size="small" onClick={() => onClick(CoauthorStatus.REJECTED)}>
                  {t('page.coauthor_detail.deny_label')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ProposalCoAuthorStatus
