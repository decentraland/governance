import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { usePapaParse } from 'react-papaparse'

import sum from 'lodash/sum'
import toNumber from 'lodash/toNumber'

import { VestingLog } from '../../clients/VestingData'
import {
  FinancialRecord,
  FinancialUpdateSection,
  FinancialUpdateSectionSchema,
  UpdateAttributes,
} from '../../entities/Updates/types'
import { getFundsReleasedSinceLastUpdate } from '../../entities/Updates/utils'
import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import { formatDate } from '../../utils/date/Time'
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
  releases?: VestingLog[]
  publicUpdates?: UpdateAttributes[]
  csvInputField: string | undefined
  setCSVInputField: (value?: string) => void
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
  releases,
  publicUpdates,
  csvInputField,
  setCSVInputField,
}: Props) {
  const t = useFormatMessage()
  const { readString, jsonToCSV } = usePapaParse()
  const defaultValues = intialValues || UPDATE_FINANCIAL_INITIAL_STATE
  const getInputDefaultValue = useCallback(() => {
    const defaultRecords = defaultValues.financial_records || []
    if (defaultRecords.length > 0) {
      return jsonToCSV(defaultRecords)
    }
    return csvInputField ? csvInputField : CSV_TEXTAREA_PLACEHOLDER
  }, [defaultValues, jsonToCSV, csvInputField])

  useEffect(() => {
    setCSVInputField(getInputDefaultValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    formState: { isValid, isDirty },
    setValue,
    watch,
  } = useForm<FinancialUpdateSection>({
    defaultValues: intialValues || UPDATE_FINANCIAL_INITIAL_STATE,
    mode: 'onTouched',
  })

  const [errors, setErrors] = useState<Error[]>([])
  const financial_records = watch('financial_records')

  let typingTimeout: NodeJS.Timeout | null = null

  const handleManualInput = (value?: string) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    typingTimeout = setTimeout(() => {
      setCSVInputField(value)
    }, 1000)
  }

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
    setCSVInputField(value.trim())
  }

  const handleRemoveFile = () => {
    setCSVInputField(CSV_TEXTAREA_PLACEHOLDER)
  }

  useEffect(() => {
    if (financial_records.length > 0 && errors.length === 0) {
      onValidation({ financial_records: financial_records }, true)
    } else {
      onValidation({ financial_records: financial_records }, false)
    }
  }, [onValidation, financial_records, errors.length])

  const csvInputHandler = useCallback(
    (data: string[][]) => {
      const inputErrors: Error[] = []
      if (data.length === 0) {
        setErrors([{ row: 0, text: t('page.proposal_update.csv_empty') }])
        return
      }
      const header = data[0]
      if (header.length !== CSV_HEADER.length) {
        setErrors([{ row: 0, text: t('page.proposal_update.csv_invalid_header') }])
        return
      }
      for (let i = 0; i < CSV_HEADER.length; i++) {
        if (header[i] !== CSV_HEADER[i]) {
          setErrors([{ row: 0, text: t('page.proposal_update.csv_invalid_header') }])
          return
        }
      }
      setErrors([])

      const csvRecords: Record<string, string | number | undefined>[] = []

      for (let idx = 1; idx < data.length; idx++) {
        const record = data[idx]
        if (record.length !== CSV_HEADER.length) {
          if (record.length === 1 && record[0].trim() === '') {
            continue
          }
          inputErrors.push({
            row: idx,
            text: t('page.proposal_update.csv_invalid_row', { parsed: record.length, expected: CSV_HEADER.length }),
          })
        } else {
          const row: Record<string, string | number | undefined> = {}
          for (let i = 0; i < CSV_HEADER.length; i++) {
            const field = CSV_HEADER[i]
            const value = record[i] !== '' ? record[i].trim() : undefined
            const isNumber = field === 'amount'
            row[field] = isNumber ? toNumber(value) : value
          }
          csvRecords.push(row)
        }
      }
      if (csvRecords.length > 0) {
        const parsedResult = FinancialUpdateSectionSchema.safeParse({ financial_records: csvRecords })
        if (parsedResult.success) {
          setErrors([])
          setValue('financial_records', parsedResult.data.financial_records)
        } else {
          const fieldErrors = parsedResult.error.issues.map((issue) => ({
            row: Number(issue.path[1]) + 1,
            text: t('page.proposal_update.csv_row_error', { field: issue.path[2], error: issue.message }),
          }))
          inputErrors.push(...fieldErrors)
          const fieldsWithoutErrors = csvRecords.filter((_, idx) => !fieldErrors.some((error) => error.row === idx + 1))
          const parsedResultWithoutErrors = FinancialUpdateSectionSchema.safeParse({
            financial_records: fieldsWithoutErrors,
          })
          if (parsedResultWithoutErrors.success) {
            setValue('financial_records', parsedResultWithoutErrors.data.financial_records)
          }
        }
      } else {
        setValue('financial_records', [])
      }

      if (inputErrors.length > 0) {
        setErrors(inputErrors)
      }
    },
    [setErrors, setValue, t]
  )

  useEffect(() => {
    readString<string[]>(csvInputField || '', {
      worker: true,
      complete: (results) => {
        const { data } = results
        csvInputHandler(data)
      },
    })
  }, [csvInputField, csvInputHandler, readString])

  const { value: releasedFundsValue, txAmount } = getFundsReleasedSinceLastUpdate(publicUpdates, releases)
  const lastRelease = releases?.[0]
  const fundsDisclosed = sum(financial_records.map(({ amount }) => amount))
  const fundsUndisclosed = fundsDisclosed <= releasedFundsValue ? releasedFundsValue - fundsDisclosed : 0
  const { formatNumber } = useIntl()

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
            value={releasedFundsValue}
            subtitle={
              lastRelease
                ? t('page.proposal_update.funds_released_sublabel', {
                    amount: txAmount,
                    time: formatDate(new Date(lastRelease.timestamp)),
                  })
                : undefined
            }
          />
          <FinancialCard
            type="outcome"
            title={t('page.proposal_update.funds_disclosed_label')}
            value={fundsDisclosed}
            subtitle={t('page.proposal_update.funds_disclosed_sublabel', {
              funds: formatNumber(fundsUndisclosed, CURRENCY_FORMAT_OPTIONS),
            })}
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
          value={csvInputField}
          errors={errors}
        />
        <div className="FinancialSection__DragAndDropContainer">
          <CSVDragAndDrop onUploadAccepted={handleFileUpload} onRemoveFile={handleRemoveFile} />
        </div>
      </ContentSection>
      {financial_records.length > 0 && (
        <ContentSection>
          <Label>{t('page.proposal_update.summary_label')}</Label>
          <SummaryItems financialRecords={financial_records} itemsInitiallyExpanded />
        </ContentSection>
      )}
    </ProjectRequestSection>
  )
}

export default FinancialSection
