import React from 'react'

import './StatsContainer.css'

export default function StatsContainer({ children }: { children: React.ReactNode }) {
  return <div className="StatsContainer">{children}</div>
}
