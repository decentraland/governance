import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import LinkIcon from '../../Icon/LinkIcon'

import './CandidateDetails.css'

interface Props {
  title: string
  content?: string
  links?: string[]
  skills?: string[]
}

function linkShortener(link: string) {
  const optimalLength = 26

  const linkTrimmed = link.replace(/^https?\:\/\//i, '').replace(/^www\./i, '')

  return linkTrimmed.length > optimalLength ? linkTrimmed.substring(0, optimalLength - 3).concat('...') : linkTrimmed
}

function CandidateDetails({ title, content, links, skills }: Props) {
  return (
    <div
      className={TokenList.join([
        'CandidateDetails',
        links && links.length === 0 && 'CandidateDetails--hidden',
        skills && skills.length === 0 && 'CandidateDetails--hidden',
      ])}
    >
      <Header size="tiny" sub className="CandidateDetails__Title">
        {title}
      </Header>
      <Paragraph
        small
        className={TokenList.join([
          'CandidateDetails__Content',
          skills && 'CandidateDetails__Content--skills',
          links && 'CandidateDetails__Content--links',
        ])}
      >
        {content}
        {links &&
          links.map((link) => (
            <a href={link}>
              <LinkIcon color="var(--blue)" /> {linkShortener(link)}
            </a>
          ))}
        {skills && skills.map((skill) => <span className="Chip">{skill.toUpperCase()}</span>)}
      </Paragraph>
    </div>
  )
}

export default CandidateDetails
