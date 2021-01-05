import fetch from 'isomorphic-fetch'
import { Embed, EmbedType } from './types'

export async function getEmbed(url: string): Promise<Embed | null> {
  if (url.startsWith('https://forum.decentraland.org/t/')) {
    return loadEmbed(url, EmbedType.Topic, loadTopic(url))
  } else if (url.startsWith('https://www.loom.com/share/')) {
    return loadEmbed(url, EmbedType.LoomVideo, loadLoomVideo(url))
  } else {
    return null
  }
}

async function loadEmbed<T, C>(url: string, type: T, contentLoader: Promise<C>) {
  try {
    const content = await contentLoader
    return { url, type, content }
  } catch (err) {
    console.error(err)
  }

  return null
}

// https://forum.decentraland.org/t/dao-proposal-not-your-coin-dcl-wearables/369
async function loadTopic(originUrl: string) {
  const url = new URL(originUrl)
  const match = url.pathname.match(/^\/t\/[a-zA-Z0-9-]+\/(\d+)\/?$/i)
  if (!match) {
    throw new Error(`Unexpected url: "${originUrl}"`)
  }

  const [, id] = match
  const request = await fetch(`https://forum.decentraland.org/t/${id}/posts.json`)
  const body = await request.json()

  if (body?.post_stream?.posts && body.post_stream.posts[0]) {
    return body.post_stream.posts[0]
  }

  throw new Error(`Unexpected responde from url: "${originUrl}"`)
}

// https://www.loom.com/share/1e50411ca90d46148ae8478e9dfb4624
async function loadLoomVideo(originUrl: string) {
  const url = new URL(originUrl)
  const match = url.pathname.match(/^\/share\/([0-9a-f]+)\/?$/i)
  if (!match) {
    throw new Error(`Unexpected url: "${originUrl}"`)
  }

  const [, id] = match
  return `
    <div style="position: relative; padding-bottom: 56.25%; height: 0;">
      <iframe src="https://www.loom.com/embed/${id}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
    </div>
    `
}
