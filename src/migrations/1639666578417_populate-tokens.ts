/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Ethereum Tokens
  pgm.sql(`
      INSERT
      INTO public.tokens (id, contract, network, name, symbol, decimals, created_at)
      VALUES (1, '0x0f5d2fb29fb7d3cfee444a200298f468908cc942', 1, 'mana', 'MANA', 18, CURRENT_TIMESTAMP)
  `)
  pgm.sql(`
      INSERT
      INTO public.tokens (id, contract, network, name, symbol, decimals, created_at)
      VALUES (2, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 1, 'ether', 'ETH', 18, CURRENT_TIMESTAMP)
  `)
  pgm.sql(`
      INSERT
      INTO public.tokens (id, contract, network, name, symbol, decimals, created_at)
      VALUES (3, '0x6b175474e89094c44da98b954eedeac495271d0f', 1, 'dai', 'DAI', 18, CURRENT_TIMESTAMP)
  `)
  pgm.sql(`
      INSERT
      INTO public.tokens (id, contract, network, name, symbol, decimals, created_at)
      VALUES (4, '0xdac17f958d2ee523a2206206994597c13d831ec7', 1, 'tether', 'USDT', 6, CURRENT_TIMESTAMP)
  `)
  pgm.sql(`
      INSERT
      INTO public.tokens (id, contract, network, name, symbol, decimals, created_at)
      VALUES (5, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 1, 'usdc', 'USDC', 6, CURRENT_TIMESTAMP)
  `)

  // Matic Tokens
  pgm.sql(`
      INSERT
      INTO public.tokens (id, contract, network, name, symbol, decimals, created_at)
      VALUES (6, '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4', 137, 'mana', 'MANA', 18, CURRENT_TIMESTAMP)
  `)
  pgm.sql(`
      INSERT
      INTO public.tokens (id, contract, network, name, symbol, decimals, created_at)
      VALUES (7, '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 137, 'ether', 'ETH', 18, CURRENT_TIMESTAMP)
  `)
  pgm.sql(`
      INSERT
      INTO public.tokens (id, contract, network, name, symbol, decimals, created_at)
      VALUES (8, '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', 137, 'dai', 'DAI', 18, CURRENT_TIMESTAMP)
  `)
  pgm.sql(`
      INSERT
      INTO public.tokens (id, contract, network, name, symbol, decimals, created_at)
      VALUES (9, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 137, 'tether', 'USDT', 6, CURRENT_TIMESTAMP)
  `)
  pgm.sql(`
      INSERT
      INTO public.tokens (id, contract, network, name, symbol, decimals, created_at)
      VALUES (10, '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', 137, 'usdc', 'USDC', 6, CURRENT_TIMESTAMP)
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
      DELETE
      FROM public.tokens
      WHERE contract
                IN (
                    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
                    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                    '0x6b175474e89094c44da98b954eedeac495271d0f',
                    '0xdac17f958d2ee523a2206206994597c13d831ec7',
                    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                    '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4',
                    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
                    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
                    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
                    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
                );
  `)
}









