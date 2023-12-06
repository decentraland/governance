import { useState } from 'react'
import { formatFileSize, useCSVReader } from 'react-papaparse'

import useFormatMessage from '../../hooks/useFormatMessage'
import CSV from '../Icon/CSV'

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

export default function CSVDragAndDrop() {
  const { CSVReader } = useCSVReader()
  const t = useFormatMessage()
  const [errorMsg, setErrorMsg] = useState<string | undefined>()

  const fileHandler = (data: CSVFile) => {
    // console.log('---------------------------')
    // console.log(data)
    // console.log('---------------------------')
    console.log(data.errors.length)
    if (data.errors.length > 0) {
      setErrorMsg(data.errors[0][0].message)
    } else {
      setErrorMsg(undefined)
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
        ({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, Remove }: any) => (
          <>
            <div {...getRootProps()} className="CSVDragAndDrop__Zone">
              {acceptedFile && !errorMsg ? (
                <>
                  <div className="CSVDragAndDrop__File">
                    <div className="CSVDragAndDrop__Info">
                      <span className="CSVDragAndDrop__Size">{formatFileSize(acceptedFile.size)}</span>
                      <span className="CSVDragAndDrop__Name">{acceptedFile.name}</span>
                    </div>
                    <div className="CSVDragAndDrop__ProgressBar">
                      <ProgressBar />
                    </div>
                    <div {...getRemoveFileProps()} className="CSVDragAndDrop__Remove">
                      <Remove />
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
    </CSVReader>
  )
}
