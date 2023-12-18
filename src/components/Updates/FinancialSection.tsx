import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { usePapaParse } from 'react-papaparse'

import toNumber from 'lodash/toNumber'

import { UpdateFinancial, UpdateFinancialRecord, UpdateFinancialSchema } from '../../entities/Updates/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import CSVDragAndDrop from '../Common/CSVDragAndDrop'
import NumberedTextArea from '../Common/NumberedTextArea'
import SubLabel from '../Common/SubLabel'
import Label from '../Common/Typography/Label'
import { ContentSection } from '../Layout/ContentLayout'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'

import './FinancialSection.css'
import SummaryItems from './SummaryItems'

interface Props {
  onValidation: (data: UpdateFinancial, sectionValid: boolean) => void
  isFormDisabled: boolean
  sectionNumber: number
  intialValues?: Partial<UpdateFinancial>
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

const CSV_TEXTAREA_PLACEHOLDER = CSV_HEADER.join(SEPARATOR)

function FinancialSection({ onValidation, isFormDisabled, sectionNumber, intialValues }: Props) {
  const t = useFormatMessage()
  const { readString, jsonToCSV } = usePapaParse()
  const defaultValues = intialValues || UPDATE_FINANCIAL_INITIAL_STATE
  const handleInputDefaultValue = () => {
    const defaultRecords = defaultValues.records || []
    return defaultRecords.length > 0 ? jsonToCSV(defaultRecords) : CSV_TEXTAREA_PLACEHOLDER
  }

  const {
    formState: { isValid, isDirty },
    setValue,
    watch,
  } = useForm<UpdateFinancial>({
    defaultValues,
    mode: 'onTouched',
  })

  const [csvInput, setCsvInput] = useState<string | undefined>(handleInputDefaultValue())
  const [errors, setErrors] = useState<{ row: number; text: string }[]>([])
  const records = watch('records')
  const clearRecords = useCallback(() => setValue('records', []), [setValue])

  const handleFileUpload = (data: string[][]) => {
    let value = ''
    for (let idx = 0; idx < data.length; idx++) {
      const record = data[idx]
      const isEmptyRow = record.every((value) => value === '')
      if (!isEmptyRow) {
        value = value.concat(
          `${record.map((value) => (value.indexOf(SEPARATOR) > 0 ? `"${value}"` : value)).join(SEPARATOR)}\n`
        )
      }
    }
    setCsvInput(value.trim())
  }

  const handleRemoveFile = () => {
    setCsvInput(CSV_TEXTAREA_PLACEHOLDER)
  }

  useEffect(() => {
    if (records.length > 0) {
      onValidation({ records }, true)
    } else {
      onValidation({ records }, false)
    }
  }, [onValidation, records])

  const csvInputHandler = useCallback(
    (data: string[][]) => {
      if (data.length === 0) {
        setErrors([{ row: 0, text: t('page.proposal_update.csv_empty') }])
        clearRecords()
        return
      }
      const header = data[0]
      if (header.length !== CSV_HEADER.length) {
        setErrors([{ row: 0, text: t('page.proposal_update.csv_invalid_header') }])
        clearRecords()
        return
      }
      for (let i = 0; i < CSV_HEADER.length; i++) {
        if (header[i] !== CSV_HEADER[i]) {
          setErrors([{ row: 0, text: t('page.proposal_update.csv_invalid_header') }])
          clearRecords()
          return
        }
      }

      const csvRecords: Record<string, string | number>[] = []

      for (let idx = 1; idx < data.length; idx++) {
        const record = data[idx]
        const isEmptyRow = record.every((value) => value === '')
        if (!isEmptyRow) {
          if (record.length !== CSV_HEADER.length) {
            setErrors([{ row: idx + 1, text: t('page.proposal_update.csv_invalid_row') }])
            clearRecords()
            return
          }
          const row: Record<string, string | number> = {}
          for (let i = 0; i < CSV_HEADER.length; i++) {
            const field = CSV_HEADER[i]
            const value = record[i]
            const isNumber = field === 'amount'
            row[field] = isNumber ? toNumber(value) : value
          }
          csvRecords.push(row)
        }
      }
      if (csvRecords.length > 0) {
        const parsedResult = UpdateFinancialSchema.safeParse({ records: csvRecords })
        if (parsedResult.success) {
          setErrors([])
          setValue('records', parsedResult.data.records)
        } else {
          const fieldErrors = parsedResult.error.issues.map((issue) => ({
            row: Number(issue.path[1]) + 1,
            text: t('page.proposal_update.csv_row_error', { field: issue.path[2], error: issue.message }),
          }))
          clearRecords()
          setErrors(fieldErrors)
        }
      } else {
        clearRecords()
        setErrors([])
      }
    },
    [clearRecords, setValue, t]
  )

  useEffect(() => {
    readString<string[]>(csvInput || '', {
      worker: true,
      complete: (results) => {
        const { data } = results
        csvInputHandler(data)
      },
    })
  }, [csvInput, csvInputHandler, readString])

  return (
    <ProjectRequestSection
      validated={isValid}
      isFormEdited={isDirty}
      sectionTitle={t('page.proposal_update.financial_section_title')}
      sectionNumber={sectionNumber}
      isNew
    >
      <ContentSection>
        <Label>{t('page.proposal_update.reporting_label')}</Label>
        <SubLabel>{t('page.proposal_update.reporting_description')}</SubLabel>
        <NumberedTextArea
          disabled={isFormDisabled}
          onInput={(value) => setCsvInput(value)}
          value={csvInput}
          errors={errors}
        />
        <div className="FinancialSection__DragAndDropContainer">
          <CSVDragAndDrop onUploadAccepted={handleFileUpload} onRemoveFile={handleRemoveFile} />
        </div>
      </ContentSection>
      {records.length > 0 && (
        <ContentSection>
          <Label>{t('page.proposal_update.summary_label')}</Label>
          <SubLabel>{t('page.proposal_update.summary_description')}</SubLabel>
          <SummaryItems records={records} />
        </ContentSection>
      )}
    </ProjectRequestSection>
  )
}

export default FinancialSection
