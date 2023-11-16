import './AuthorDetailsStat.css'

interface Props {
  label: string
  description: string
}

export default function AuthorDetailsStat({ label, description }: Props) {
  return (
    <div className="AuthorDetailsStat">
      <p className="AuthorDetailsStat__Label">{label}</p>
      <p className="AuthorDetailsStat__Description">{description}</p>
    </div>
  )
}
