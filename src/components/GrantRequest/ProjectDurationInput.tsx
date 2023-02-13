import React, { useCallback } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import Label from '../Common/Label'
import Add from '../Icon/Add'
import Remove from '../Icon/Remove'

import './ProjectDurationInput.css'

interface Props {
  value: number
  onChange: (value: number) => void
  options: number[]
}

const ProjectDurationInput = ({ value, onChange, options }: Props) => {
  const t = useFormatMessage()
  const optionMinLimit = options[0]
  const optionMaxLimit = options[options.length - 1]

  const handleAddClick = useCallback(() => {
    if (value === optionMaxLimit) {
      return
    }

    onChange(value + 1)
  }, [onChange, optionMaxLimit, value])

  const handleRemoveClick = useCallback(() => {
    if (value === optionMinLimit) {
      return
    }

    onChange(value - 1)
  }, [onChange, optionMinLimit, value])

  return (
    <div>
      <Label>{t('page.submit_grant.funding_section.project_duration_title')}</Label>
      <div>
        <div className="ProjectDurationInput__InputContainer">
          <div className="ProjectDurationInput__Input">
            <button className="ProjectDurationInput__Button" onClick={handleRemoveClick}>
              <Remove />
            </button>
            <span className="ProjectDurationInput__Value">{value}</span>
            <button className="ProjectDurationInput__Button" onClick={handleAddClick}>
              <Add />
            </button>
          </div>
          <div className="ProjectDurationInput__Description">months</div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDurationInput
