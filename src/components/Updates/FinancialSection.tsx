import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { usePapaParse } from 'react-papaparse'

import sum from 'lodash/sum'
import toNumber from 'lodash/toNumber'

import { TransparencyVesting } from '../../clients/DclData'
import {
  FinancialRecord,
  FinancialUpdateSection,
  FinancialUpdateSectionSchema,
  UpdateAttributes,
} from '../../entities/Updates/types'
import { getFundsReleasedSinceLastUpdate } from '../../entities/Updates/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import CSVDragAndDrop from '../Common/CSVDragAndDrop'
import NumberedTextArea from '../Common/NumberedTextArea'
import Label from '../Common/Typography/Label'
import Markdown from '../Common/Typography/Markdown'
import { ContentSection } from '../Layout/ContentLayout'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'

import FinancialCard from './FinancialCard'
import './FinancialSection.css'
import SummaryItems from './SummaryItems'

interface Props {
  onValidation: (data: FinancialUpdateSection, sectionValid: boolean) => void
  isFormDisabled: boolean
  sectionNumber: number
  intialValues?: Partial<FinancialUpdateSection>
  vesting?: TransparencyVesting
  publicUpdates?: UpdateAttributes[]
  updateId?: string
}

type Error = {
  row: number
  text: string
}

const UPDATE_FINANCIAL_INITIAL_STATE: FinancialUpdateSection = {
  financial_records: [],
}

const CSV_HEADER: (keyof FinancialRecord)[] = ['category', 'description', 'token', 'amount', 'receiver', 'link']

const SEPARATOR = ','

const CSV_TEXTAREA_PLACEHOLDER = CSV_HEADER.join(SEPARATOR)

function FinancialSection({
  onValidation,
  isFormDisabled,
  sectionNumber,
  intialValues,
  vesting,
  publicUpdates,
  updateId,
}: Props) {
  const localStorageKey = updateId ? `update-${updateId}-financial` : undefined
  const t = useFormatMessage()
  const { readString, jsonToCSV } = usePapaParse()
  const defaultValues = intialValues || UPDATE_FINANCIAL_INITIAL_STATE
  const getInputDefaultValue = () => {
    const defaultRecords = defaultValues.financial_records || []
    if (defaultRecords.length > 0) {
      return jsonToCSV(defaultRecords)
    }
    const localStorageValue = localStorage.getItem(localStorageKey || '')
    return localStorageValue ? localStorageValue : CSV_TEXTAREA_PLACEHOLDER
  }

  const {
    formState: { isValid, isDirty },
    setValue,
    watch,
  } = useForm<FinancialUpdateSection>({
    defaultValues: intialValues || UPDATE_FINANCIAL_INITIAL_STATE,
    mode: 'onTouched',
  })

  const [csvInput, setCsvInput] = useState<string | undefined>(getInputDefaultValue())
  const [errors, setErrors] = useState<Error[]>([])
  const financial_records = watch('financial_records')
  const clearRecords = useCallback(() => setValue('financial_records', []), [setValue])

  let typingTimeout: NodeJS.Timeout | null = null

  const handleManualInput = (value?: string) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    typingTimeout = setTimeout(() => {
      setCsvInput(value)
      if (localStorageKey) {
        localStorage.setItem(localStorageKey, value || '')
      }
    }, 1000)
  }

  const handleErrors = useCallback(
    (errors: Error[], shouldClearRecords: boolean = true) => {
      setErrors(errors)
      if (shouldClearRecords) {
        clearRecords()
      }
    },
    [clearRecords]
  )

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
    if (financial_records.length > 0) {
      onValidation({ financial_records: financial_records }, true)
    } else {
      onValidation({ financial_records: financial_records }, false)
    }
  }, [onValidation, financial_records])

  const csvInputHandler = useCallback(
    (data: string[][]) => {
      const inputErrors: Error[] = []
      if (data.length === 0) {
        handleErrors([{ row: 0, text: t('page.proposal_update.csv_empty') }])
        return
      }
      const header = data[0]
      if (header.length !== CSV_HEADER.length) {
        handleErrors([{ row: 0, text: t('page.proposal_update.csv_invalid_header') }])
        return
      }
      for (let i = 0; i < CSV_HEADER.length; i++) {
        if (header[i] !== CSV_HEADER[i]) {
          handleErrors([{ row: 0, text: t('page.proposal_update.csv_invalid_header') }])
          return
        }
      }

      const csvRecords: Record<string, string | number | undefined>[] = []

      for (let idx = 1; idx < data.length; idx++) {
        const record = data[idx]
        if (record.length !== CSV_HEADER.length) {
          inputErrors.push({
            row: idx,
            text: t('page.proposal_update.csv_invalid_row', { parsed: record.length, expected: CSV_HEADER.length }),
          })
        } else {
          const row: Record<string, string | number | undefined> = {}
          for (let i = 0; i < CSV_HEADER.length; i++) {
            const field = CSV_HEADER[i]
            const value = record[i] !== '' ? record[i] : undefined
            const isNumber = field === 'amount'
            row[field] = isNumber ? toNumber(value) : value
          }
          csvRecords.push(row)
        }
      }
      if (csvRecords.length > 0) {
        const parsedResult = FinancialUpdateSectionSchema.safeParse({ financial_records: csvRecords })
        if (parsedResult.success) {
          handleErrors([], false)
          setValue('financial_records', parsedResult.data.financial_records)
        } else {
          const fieldErrors = parsedResult.error.issues.map((issue) => ({
            row: Number(issue.path[1]) + 1,
            text: t('page.proposal_update.csv_row_error', { field: issue.path[2], error: issue.message }),
          }))
          inputErrors.push(...fieldErrors)
        }
      }

      if (inputErrors.length > 0) {
        handleErrors(inputErrors)
      }
    },
    [handleErrors, setValue, t]
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
        <div className="FinancialSection__CardsContainer">
          <FinancialCard
            type="income"
            title={t('page.proposal_update.funds_released_label')}
            value={getFundsReleasedSinceLastUpdate(publicUpdates, vesting)}
          />
          <FinancialCard
            type="outcome"
            title={t('page.proposal_update.funds_disclosed_label')}
            value={sum(financial_records.map(({ amount }) => amount))}
          />
        </div>
      </ContentSection>
      <ContentSection>
        <Label>{t('page.proposal_update.reporting_label')}</Label>
        <Markdown componentsClassNames={{ p: 'FinancialSection__ReportingSublabel' }}>
          {t('page.proposal_update.reporting_description')}
        </Markdown>
        <NumberedTextArea
          disabled={isFormDisabled}
          onInput={(value) => handleManualInput(value)}
          value={csvInput}
          errors={errors}
        />
        <div className="FinancialSection__DragAndDropContainer">
          <CSVDragAndDrop onUploadAccepted={handleFileUpload} onRemoveFile={handleRemoveFile} />
        </div>
      </ContentSection>
      {financial_records.length > 0 && (
        <ContentSection>
          <Label>{t('page.proposal_update.summary_label')}</Label>
          <SummaryItems financialRecords={financial_records} />
        </ContentSection>
      )}
    </ProjectRequestSection>
  )
}

export default FinancialSection
