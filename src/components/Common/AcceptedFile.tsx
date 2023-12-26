import { formatFileSize } from 'react-papaparse'

import CSV from '../Icon/CSV'
import CsvRemove from '../Icon/CsvRemove'

import Text from './Typography/Text'

import './AcceptedFile.css'

interface Props {
  file: File
  onRemoveFile: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  removeFileProps: object
  progressBar: React.ReactNode
}

function AcceptedFile({ file, onRemoveFile, removeFileProps, progressBar }: Props) {
  return (
    <>
      <div className="AcceptedFile">
        <div className="AcceptedFile__InfoContainer">
          <CSV size={24} />
          <div className="AcceptedFile__Info">
            <Text weight="semi-bold" size="md" className="AcceptedFile__Name">
              {file.name}
            </Text>
            <Text size="sm" weight="normal" className="AcceptedFile__Size">
              {formatFileSize(file.size)}
            </Text>
          </div>
        </div>
        <div className="AcceptedFile__ProgressBarContainer">{progressBar}</div>
        <div {...removeFileProps} className="AcceptedFile__Remove" onClick={onRemoveFile}>
          <CsvRemove />
        </div>
      </div>
    </>
  )
}

export default AcceptedFile
