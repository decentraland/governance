import { useState } from 'react'
import { useCSVReader } from 'react-papaparse'

import useFormatMessage from '../../hooks/useFormatMessage'
import CSV from '../Icon/CSV'

import Text from './Typography/Text'

import AcceptedFile from './AcceptedFile'
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
  onUploadAccepted: (data: string[][]) => void
  onRemoveFile?: () => void
}

export default function CSVDragAndDrop({ onUploadAccepted, onRemoveFile }: Props) {
  const { CSVReader } = useCSVReader()
  const t = useFormatMessage()
  const [errorMsg, setErrorMsg] = useState<string | undefined>()
  const [showFile, setShowFile] = useState(false)

  const fileHandler = (data: CSVFile) => {
    if (data.errors.length > 0) {
      setErrorMsg(data.errors[0][0].message)
    } else {
      setShowFile(true)
      onUploadAccepted(data.data)
      setTimeout(() => {
        setShowFile(false)
      }, 2000)
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
                {showFile && acceptedFile && !errorMsg ? (
                  <AcceptedFile
                    file={acceptedFile}
                    onRemoveFile={(e) => {
                      e.preventDefault()
                      onRemoveFile?.()
                      onRemoveClick(e)
                    }}
                    removeFileProps={removeFileProps}
                    progressBar={<ProgressBar className="CSVDragAndDrop__ProgressBar" />}
                  />
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
