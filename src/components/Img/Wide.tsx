import React from 'react'

export type WideProps = {
  src?: string
}

export default function Wide({ src, ...props }: WideProps) {
  return <div style={{ backgroundImage: src && `url("${src}")` }}>
    <img {...props} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAADUlEQVR4AWNwL/ABYwAKHQIHW//QwwAAAABJRU5ErkJggg==" width="2" height="1" />
  </div>
}