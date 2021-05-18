
import React, { useEffect } from "react"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Container } from "decentraland-ui/dist/components/Container/Container"

import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import Carousel from "decentraland-gatsby/dist/components/Carousel/Carousel"
import WelcomeItem from "../components/Welcome/WelcomeItem"
import Markdown from "decentraland-gatsby/dist/components/Text/Markdown"
import locations, { WELCOME_STORE_KEY, WELCOME_STORE_VERSION } from "../modules/locations"
import { navigate } from "gatsby-plugin-intl"

import './index.css'
import './welcome.css'

export default function ActivityPage() {
  const l = useFormatMessage()
  function handleClose() {
    navigate(locations.proposals())
  }

  useEffect(() => { localStorage.setItem(WELCOME_STORE_KEY, WELCOME_STORE_VERSION) }, [])

  return <>
    <Container className="WelcomePage">
      <div>
        <Carousel>
          <WelcomeItem onClose={handleClose}>
            <Header>{l('page.welcome.1_panel_title')}</Header>
            <Markdown source={l('page.welcome.1_panel_description')!}/>
          </WelcomeItem>
          <WelcomeItem onClose={handleClose}>
            <Header>{l('page.welcome.2_panel_title')}</Header>
            <Markdown source={l('page.welcome.2_panel_description')!}/>
          </WelcomeItem>
          <WelcomeItem onClose={handleClose}>
            <Header>{l('page.welcome.3_panel_title')}</Header>
            <Markdown source={l('page.welcome.3_panel_description')!}/>
          </WelcomeItem>
          <WelcomeItem onClose={handleClose}>
            <Header>{l('page.welcome.4_panel_title')}</Header>
            <Markdown source={l('page.welcome.4_panel_description')!}/>
          </WelcomeItem>
        </Carousel>
      </div>
    </Container>
  </>
}
