import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const situationsProblemes = pgTable('situations_problemes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  mode: text('mode').notNull(),                 // 'sequence' ou 'notion'
  module: text('module').notNull(),
  sequence: text('sequence').notNull(),
  savoirsCouverts: jsonb('savoirs_couverts').notNull(), // Tableau JSONB
  dureeEstimee: text('duree_estimee').notNull(),
  contenuJson: jsonb('contenu_json').notNull(),     // Objet JSONB complet
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
