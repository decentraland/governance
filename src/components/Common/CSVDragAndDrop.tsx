import { useState } from 'react'
import { formatFileSize, useCSVReader } from 'react-papaparse'

import useFormatMessage from '../../hooks/useFormatMessage'
import CSV from '../Icon/CSV'
import CsvRemove from '../Icon/CsvRemove'

import Text from './Typography/Text'

import './CSVDragAndDrop.css'

type CSVError = {
  type: string
  code: string
  message: string
}

type CSVFile = {
  data: string[][]
  errors: CSVError[][]
  meta: unknown[]
}

interface Props {
  onUploadAccepted: (data: string[][]) => { ok: boolean; message?: string }
  onRemoveFile?: () => void
}

export default function CSVDragAndDrop({ onUploadAccepted, onRemoveFile }: Props) {
  const { CSVReader } = useCSVReader()
  const t = useFormatMessage()
  const [errorMsg, setErrorMsg] = useState<string | undefined>()

  const fileHandler = (data: CSVFile) => {
    if (data.errors.length > 0) {
      setErrorMsg(data.errors[0][0].message)
    } else {
      const result = onUploadAccepted(data.data)
      if (!result.ok) {
        setErrorMsg(result.message)
      } else {
        setErrorMsg(undefined)
      }
    }
  }

  return (
    <CSVReader
      onUploadAccepted={fileHandler}
      onDragOver={(event: DragEvent) => {
        event.preventDefault()
      }}
      onDragLeave={(event: DragEvent) => {
        event.preventDefault()
      }}
    >
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps }: any) => {
          const { onClick: onRemoveClick, ...removeFileProps } = getRemoveFileProps()
          return (
            <>
              <div {...getRootProps()} className="CSVDragAndDrop__Zone">
                {acceptedFile && !errorMsg ? (
                  <>
                    <div className="CSVDragAndDrop__File">
                      <div className="CSVDragAndDrop__InfoContainer">
                        <CSV size={24} />
                        <div className="CSVDragAndDrop__Info">
                          <Text weight="semi-bold" size="md" className="CSVDragAndDrop__Name">
                            {acceptedFile.name}
                          </Text>
                          <Text size="sm" weight="normal" className="CSVDragAndDrop__Size">
                            {formatFileSize(acceptedFile.size)}
                          </Text>
                        </div>
                      </div>
                      <div className="CSVDragAndDrop__ProgressBarContainer">
                        <ProgressBar className="CSVDragAndDrop__ProgressBar" />
                      </div>
                      <div
                        {...removeFileProps}
                        className="CSVDragAndDrop__Remove"
                        onClick={(e) => {
                          e.preventDefault()
                          onRemoveFile?.()
                          onRemoveClick(e)
                        }}
                      >
                        <CsvRemove />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="CSVDragAndDrop__TextContainer">
                    {errorMsg ? (
                      <span className="CSVDragAndDrop__TextFile">{errorMsg}</span>
                    ) : (
                      <>
                        <CSV />
                        <Text>
                          {t('csv_file.drag_and_drop')}{' '}
                          <span className="CSVDragAndDrop__TextFile">{t('csv_file.choose_file')}</span>.
                        </Text>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )
        }
      }
    </CSVReader>
  )
}
