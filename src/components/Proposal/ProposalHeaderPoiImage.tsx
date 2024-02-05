import './ProposalHeaderPoiImage.css'

type Props = {
  dimension: 'wide' | 'standard'
  size?: 'cover' | 'initial'
  src: string
}

export default function ProposalHeaderPoiImage({ src, dimension, size = 'cover' }: Props) {
  return (
    <div
      className="ProposalHeaderPoiImage"
      style={{
        backgroundSize: size,
        backgroundImage: src && `url("${src}")`,
      }}
    >
      {dimension === 'wide' && (
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAADUlEQVR4AWNwL/ABYwAKHQIHW//QwwAAAABJRU5ErkJggg=="
          width="2"
          height="1"
        />
      )}
      {dimension === 'standard' && (
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAAD0lEQVR4AWNwL/BBwYQFADuuDCW4Y5knAAAAAElFTkSuQmCC"
          width="4"
          height="3"
        />
      )}
    </div>
  )
}
