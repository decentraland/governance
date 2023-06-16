import React from 'react'

import classNames from 'classnames'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import Text from '../../Common/Text/Text'
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
      className={classNames(
        'CandidateDetails',
        links && links.length === 0 && 'CandidateDetails--hidden',
        skills && skills.length === 0 && 'CandidateDetails--hidden'
      )}
    >
      <Header size="tiny" sub className="CandidateDetails__Title">
        {title}
      </Header>
      <Text
        size="md"
        className={classNames(
          'CandidateDetails__Content',
          skills && 'CandidateDetails__Content--skills',
          links && 'CandidateDetails__Content--links'
        )}
      >
        {content}
        {links &&
          links.map((link, idx) => (
            <a href={link} key={`links_${idx}`}>
              <LinkIcon color="var(--blue-800)" /> {link.replace(/^https?:\/\//i, '').replace(/^www\./i, '')}
            </a>
          ))}
        {skills &&
          skills.map((skill, idx) => (
            <span className="CandidateDetails__Chip" key={`skills_${idx}`}>
              {skill.toUpperCase()}
            </span>
          ))}
      </Text>
    </div>
  )
}

export default CandidateDetails
