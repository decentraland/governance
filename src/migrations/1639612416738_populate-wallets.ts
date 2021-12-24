/* eslint-disable camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
      INSERT
      INTO public.wallets (id, address, name, network, created_at)
      VALUES (1, '0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce', 'Aragon Agent', 1, CURRENT_TIMESTAMP);
  `)
  pgm.sql(`
      INSERT
      INTO public.wallets (id, address, name, network, created_at)
      VALUES (2, '0x89214c8Ca9A49E60a3bfa8e00544F384C93719b1', 'Gnosis Safe', 1, CURRENT_TIMESTAMP);
  `)
  pgm.sql(`
      INSERT
      INTO public.wallets (id, address, name, network, created_at)
      VALUES (3, '0xB08E3e7cc815213304d884C88cA476ebC50EaAB2', 'Gnosis Safe', 137, CURRENT_TIMESTAMP);
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
      DELETE
      FROM public.wallets
      WHERE address
                IN (
                    '0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce',
                    '0x89214c8Ca9A49E60a3bfa8e00544F384C93719b1',
                    '0xB08E3e7cc815213304d884C88cA476ebC50EaAB2'
                );
  `)
}

