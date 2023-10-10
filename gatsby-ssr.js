/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */
// You can delete this file if you're not using it
export { wrapPageElement, wrapRootElement } from './gatsby-browser'

/**
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/#onPreRenderHTML
 */
export function onPreRenderHTML(
  {
    pathname,
    getHeadComponents,
    replaceHeadComponents,
    getPreBodyComponents,
    replacePreBodyComponents,
    getPostBodyComponents,
    replacePostBodyComponents,
  },
  pluginOptions
) {
  const headComponents = getHeadComponents().map((component) => {
    if (component.type !== 'style' || !component.props['data-href']) {
      return component
    }

    return <link rel="stylesheet" id={component.props.id} href={component.props['data-href']} />
  })

  replaceHeadComponents(headComponents)
}
