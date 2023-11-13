import './Counter.css'

export default function Counter({ count }: { count?: number }) {
  return <div className="Counter">{count}</div>
}
