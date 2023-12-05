import { useState } from 'react'
import { formatFileSize, lightenDarkenColor, useCSVReader } from 'react-papaparse'

import CSV from '../Icon/CSV'

import Text from './Typography/Text'

import './CSVDragAndDrop.css'

const DEFAULT_REMOVE_HOVER_COLOR = '#A01919'
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(DEFAULT_REMOVE_HOVER_COLOR, 40)

export default function CSVDragAndDrop() {
  const { CSVReader } = useCSVReader()
  const [removeHoverColor, setRemoveHoverColor] = useState(DEFAULT_REMOVE_HOVER_COLOR)

  const fileHandler = (data: string[][]) => {
    console.log('---------------------------')
    console.log(data)
    console.log('---------------------------')
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
              {acceptedFile ? (
                <>
                  <div className="CSVDragAndDrop__File">
                    <div className="CSVDragAndDrop__Info">
                      <span className="CSVDragAndDrop__Size">{formatFileSize(acceptedFile.size)}</span>
                      <span className="CSVDragAndDrop__Name">{acceptedFile.name}</span>
                    </div>
                    <div className="CSVDragAndDrop__ProgressBar">
                      <ProgressBar />
                    </div>
                    <div
                      {...getRemoveFileProps()}
                      className="CSVDragAndDrop__Remove"
                      onMouseOver={(event: Event) => {
                        event.preventDefault()
                        setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT)
                      }}
                      onMouseOut={(event: Event) => {
                        event.preventDefault()
                        setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR)
                      }}
                    >
                      <Remove color={removeHoverColor} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="CSVDragAndDrop__TextContainer">
                  <CSV />
                  <Text>
                    Drag and drop a CSV file or <span className="CSVDragAndDrop__TextFile">choose a file</span>.
                  </Text>
                </div>
              )}
            </div>
          </>
        )
      }
    </CSVReader>
  )
}
