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
          links.map((link, idx) => (
            <a href={link} key={`links_${idx}`}>
              <LinkIcon color="var(--blue)" /> {link.replace(/^https?:\/\//i, '').replace(/^www\./i, '')}
            </a>
          ))}
        {skills &&
          skills.map((skill, idx) => (
            <span className="Chip" key={`skills_${idx}`}>
              {skill.toUpperCase()}
            </span>
          ))}
      </Paragraph>
    </div>
  )
}

export default CandidateDetails
