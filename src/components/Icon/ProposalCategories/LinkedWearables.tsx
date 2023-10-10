interface Props {
  size?: number
}

function LinkedWearables({ size = 48 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="24" fill="#FFC95B" opacity="0.35"></circle>
      <path
        fill="#FFBC5B"
        d="M35.67 19.393L28.368 16c-.754.977-2.422 1.66-4.368 1.66-1.946 0-3.615-.683-4.369-1.66l-7.3 3.393a.55.55 0 00-.27.755l2.145 4.026c.15.278.51.39.806.253l2.122-.974c.398-.183.863.088.863.506v8.916c0 .622.536 1.125 1.2 1.125h9.598c.664 0 1.2-.503 1.2-1.125v-8.92c0-.414.465-.688.863-.505l2.122.973c.296.141.656.029.806-.253l2.148-4.022a.545.545 0 00-.266-.755z"
      ></path>
    </svg>
  )
}

export default LinkedWearables
