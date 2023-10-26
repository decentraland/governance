import './NotMobile.css'

export default function NotMobile({ children }: { children: React.ReactNode }) {
  return <div className="MediaQuery__NotMobile">{children}</div>
}
