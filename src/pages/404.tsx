import React from "react"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import Head from "decentraland-gatsby/dist/components/Head/Head"
import Title from "decentraland-gatsby/dist/components/Text/Title"
import Paragraph from "decentraland-gatsby/dist/components/Text/Paragraph"
import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import Navigation from "../components/Layout/Navigation"

const NotFoundPage = (props: any) => {
  const l = useFormatMessage()

  return <>
  <Navigation />
  <Container>
    <Head title={l('page.404.title') || ''} description={l('page.404.description') || ''} />
    <div style={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Title style={{ textTransform: 'uppercase' }}>
        {l('page.404.title')}
      </Title>
      <Paragraph>{l('page.404.description')}</Paragraph>
    </div>
  </Container>
  </>
}

export default NotFoundPage
