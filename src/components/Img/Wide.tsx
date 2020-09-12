import React, { CSSProperties } from 'react'

import './Img.css'

export type WideProps = {
  src?: string
  style?: CSSProperties
}

export default function Wide({ src, style }: WideProps) {
  return <div className="Img" style={{ ...style, backgroundImage: src && `url("${src}")` }}>
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAADUlEQVR4AWNwL/ABYwAKHQIHW//QwwAAAABJRU5ErkJggg==" width="2" height="1" alt="wide" />
  </div>
}
