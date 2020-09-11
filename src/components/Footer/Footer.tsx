import React from 'react'
import { FooterProps } from 'decentraland-ui/dist/components/Footer/Footer'
import { Footer as BaseFooter } from 'decentraland-dapps/dist/containers'
import * as translation from '../../modules/translation/languages'

const locales = Object.keys(translation)

const Footer = (props: FooterProps) => (
  <BaseFooter locales={locales} {...props} />
)

export default React.memo(Footer)
