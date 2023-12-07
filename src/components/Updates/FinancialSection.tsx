import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { UpdateFinancial, UpdateFinancialRecord } from '../../entities/Updates/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import CSVDragAndDrop from '../Common/CSVDragAndDrop'
import NumberedTextArea from '../Common/NumberedTextArea'
import SubLabel from '../Common/SubLabel'
import Label from '../Common/Typography/Label'
import { ContentSection } from '../Layout/ContentLayout'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'

import './FinancialSection.css'

interface Props {
  onValidation: (data: UpdateFinancial, sectionValid: boolean) => void
  isFormDisabled: boolean
  sectionNumber: number
  intialValues?: UpdateFinancial
}

const UPDATE_FINANCIAL_INITIAL_STATE: UpdateFinancial = {
  records: [],
}

const CSV_HEADER: (keyof UpdateFinancialRecord)[] = [
  'concept',
  'description',
  'amount',
  'token_type',
  'receiver',
  'link',
]

const SEPARATOR = ','

function FinancialSection({ onValidation, isFormDisabled, sectionNumber, intialValues }: Props) {
  const t = useFormatMessage()

  const {
    formState: { isValid, errors, isDirty },
    control,
    setValue,
    watch,
  } = useForm<UpdateFinancial>({
    defaultValues: intialValues || UPDATE_FINANCIAL_INITIAL_STATE,
    mode: 'onTouched',
  })

  const [csvInput, setCsvInput] = useState<string | undefined>(CSV_HEADER.join(SEPARATOR))

  const csvFileHandler = (data: string[][]): { ok: boolean; message?: string } => {
    if (data.length === 0) {
      console.error('empty')
      return { ok: false, message: t('page.proposal_update.csv_empty') }
    }
    const header = data[0]
    if (header.length !== CSV_HEADER.length) {
      console.error('invalid header')
      return { ok: false, message: t('page.proposal_update.csv_invalid_header') }
    }
    for (let i = 0; i < CSV_HEADER.length; i++) {
      if (header[i] !== CSV_HEADER[i]) {
        console.error('invalid header 2')
        return { ok: false, message: t('page.proposal_update.csv_invalid_header') }
      }
    }
    let value = ''
    for (let idx = 0; idx < data.length; idx++) {
      const record = data[idx]
      const isEmptyRow = record.every((value) => value === '')
      if (!isEmptyRow && record.length !== CSV_HEADER.length) {
        console.error('invalid row', record)
        return { ok: false, message: t('page.proposal_update.csv_invalid_row', { row: idx + 1 }) }
      }
      value = value.concat(
        `${record.map((value) => (value.indexOf(SEPARATOR) > 0 ? `"${value}"` : value)).join(SEPARATOR)}\n`
      )
    }
    setCsvInput(value)
    return { ok: true }
  }

  const removeFileHandler = () => {
    setCsvInput('')
  }

  return (
    <ProjectRequestSection
      validated={isValid}
      isFormEdited={isDirty}
      sectionTitle={t('page.proposal_update.financial_section_title')}
      sectionNumber={sectionNumber}
    >
      <ContentSection>
        <Label>{t('page.proposal_update.reporting_label')}</Label>
        <SubLabel>{t('page.proposal_update.reporting_description')}</SubLabel>
        <NumberedTextArea disabled={isFormDisabled} onInput={(value) => setCsvInput(value)} value={csvInput} />
        <div className="FinancialSection__DragAndDropContainer">
          <CSVDragAndDrop onUploadAccepted={csvFileHandler} onRemoveFile={removeFileHandler} />
        </div>
      </ContentSection>
    </ProjectRequestSection>
  )
}

export default FinancialSection
