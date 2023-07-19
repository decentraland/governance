import fetch from 'isomorphic-fetch'

import { ErrorClient } from '../../clients/ErrorClient'

import { Tile } from './types'

const LAND_URL = 'https://api.decentraland.org'

export async function getTiles(
  position1: [number, number],
  position2: [number, number],
  options: { include?: (keyof Tile)[]; exclude?: (keyof Tile)[] } = {}
): Promise<Record<string, Tile>> {
  const params = new URLSearchParams({
    x1: String(position1[0]),
    y1: String(position1[1]),
    x2: String(position2[0]),
    y2: String(position2[1]),
  })

  if (options.include && options.include.length > 0) {
    params.append('include', options.include.join(','))
  }

  if (options.exclude && options.exclude.length > 0) {
    params.append('include', options.exclude.join(','))
  }

  try {
    return (await (await fetch(`${LAND_URL}/v2/tiles?` + params.toString())).json()).data
  } catch (error) {
    const msg = 'Error fetching tiles'
    ErrorClient.report(msg, { error })
    throw new Error(msg)
  }
}

export async function getTile(
  position: [number, number],
  options: { include?: (keyof Tile)[]; exclude?: (keyof Tile)[] } = {}
): Promise<Tile | null> {
  const tiles = await getTiles(position, position, options)
  return tiles[position.join(',')] || null
}

export function getParcelImageUrl(coordinates: [number, number]) {
  const [x, y] = coordinates
  return `${LAND_URL}/v1/parcels/${x}/${y}/map.png`
}
