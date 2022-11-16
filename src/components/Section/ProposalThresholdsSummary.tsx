import React, { useRef } from 'react'
import Flickity from 'react-flickity-component'

import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import 'flickity/css/flickity.css'

import { ProposalAttributes } from '../../entities/Proposal/types'
import useAbbreviatedFormatter from '../../hooks/useAbbreviatedFormatter'
import { ChoiceProgressProps } from '../Status/ChoiceProgress'

import './ProposalThresholdsSummary.css'

const flickityOptions = {
  initialIndex: 0,
  cellSelector: '.ProposalThresholdsSummary__CarouselCell',
  cellAlign: 'center',
  contain: true,
  accessibility: true,
  pageDots: true,
  wrapAround: false,
  autoPlay: 10000,
  groupCells: false,
  prevNextButtons: false,
  setGallerySize: true,
}

export type ProposalThresholdsSummaryProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null
  partialResults: ChoiceProgressProps[]
}

export default function ProposalThresholdsSummary({ proposal, partialResults }: ProposalThresholdsSummaryProps) {
  const t = useFormatMessage()
  const vpInFavor = partialResults[0].power || 0
  const threshold = proposal?.required_to_pass || 0
  const neededForAcceptance = threshold - vpInFavor
  const thresholdReached = threshold <= vpInFavor
  const endDate = Time.from(proposal?.finish_at)
  const timeout = useCountdown(endDate)
  const valueFormatter = useAbbreviatedFormatter()
  const abbreviatedThreshold = valueFormatter(threshold)
  const flickity = useRef<Flickity>()

  return (
    <div className="DetailsSection__Content">
      {timeout.time > 0 && !thresholdReached && (
        <Flickity
          className={'ProposalThresholdsSummary__Carousel'}
          options={flickityOptions}
          flickityRef={(ref) => (flickity.current = ref)}
        >
          <div
            className="ProposalThresholdsSummary__CarouselCell ProposalThresholdsSummary__Container"
            onClick={() => flickity.current?.next()}
          >
            <div className="ProposalThresholdsSummary__Subtitle">{t('page.proposal_detail.required_vp')}</div>
            <div className="ProposalThresholdsSummary__Title">{t('general.number', { value: threshold })} VP</div>
          </div>
          <div
            className="ProposalThresholdsSummary__CarouselCell ProposalThresholdsSummary__Container"
            onClick={() => flickity.current?.previous()}
          >
            <div className="ProposalThresholdsSummary__Subtitle">{t('page.proposal_detail.needed_for_acceptance')}</div>
            <div className="ProposalThresholdsSummary__Title">
              {t('general.number', { value: neededForAcceptance })} VP
            </div>
          </div>
        </Flickity>
      )}
      {timeout.time > 0 && thresholdReached && (
        <div className="ProposalThresholdsSummary__Container">
          <div className="ProposalThresholdsSummary__Subtitle">
            {thresholdReached && t('page.proposal_detail.threshold_reached', { threshold: abbreviatedThreshold })}
          </div>
          <div className="ProposalThresholdsSummary__Title">
            <Bold>{t('page.proposal_detail.time_left_label', { countdown: endDate.fromNow() })}</Bold>
          </div>
        </div>
      )}
      {timeout.time <= 0 && (
        <div className="ProposalThresholdsSummary__Container">
          <div className="ProposalThresholdsSummary__Subtitle">
            {thresholdReached
              ? t('page.proposal_detail.threshold_reached', { threshold: abbreviatedThreshold })
              : t('page.proposal_detail.threshold_not_reached', { threshold: abbreviatedThreshold })}
          </div>
          <div className="ProposalThresholdsSummary__Title">
            <Bold>{t('page.proposal_detail.proposal_status', { status: proposal?.status })}</Bold>
          </div>
        </div>
      )}
    </div>
  )
}
