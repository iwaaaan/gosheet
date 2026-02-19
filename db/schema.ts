import {
    mysqlTable,
    varchar,
    text,
    timestamp,
    boolean,
    json,
} from "drizzle-orm/mysql-core";
import { relations } from 'drizzle-orm';

export const user = mysqlTable("user", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const session = mysqlTable("session", {
    id: varchar("id", { length: 255 }).primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => user.id),
});

export const account = mysqlTable("account", {
    id: varchar("id", { length: 255 }).primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => user.id),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = mysqlTable("verification", {
    id: varchar("id", { length: 255 }).primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt"),
});

// App Tables - Adapted for MySQL/MariaDB from schema.sql
export const projects = mysqlTable("projects", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => user.id),
    name: text("name").notNull(),
    spreadsheetId: text("spreadsheet_id").notNull(),
    googleRefreshToken: text("google_refresh_token"), // Optional for Service Account flow
    createdAt: timestamp("created_at").defaultNow(),
});

export const endpoints = mysqlTable("endpoints", {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("project_id", { length: 36 })
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    sheetName: text("sheet_name").notNull(),
    isGetEnabled: boolean("is_get_enabled").default(true),
    isPostEnabled: boolean("is_post_enabled").default(false),
    isPutEnabled: boolean("is_put_enabled").default(false),
    isDeleteEnabled: boolean("is_delete_enabled").default(false),
});

export const projectAuth = mysqlTable("project_auth", {
    projectId: varchar("project_id", { length: 36 })
        .primaryKey()
        .references(() => projects.id, { onDelete: 'cascade' }),
    authType: varchar("auth_type", { length: 20 }).default('none'),
    authConfig: json("auth_config"),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
    projects: many(projects),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
    user: one(user, {
        fields: [projects.userId],
        references: [user.id],
    }),
    endpoints: many(endpoints),
    auth: one(projectAuth, {
        fields: [projects.id],
        references: [projectAuth.projectId],
    }),
}));

export const endpointRelations = relations(endpoints, ({ one }) => ({
    project: one(projects, {
        fields: [endpoints.projectId],
        references: [projects.id],
    }),
}));

export const projectAuthRelations = relations(projectAuth, ({ one }) => ({
    project: one(projects, {
        fields: [projectAuth.projectId],
        references: [projects.id],
    }),
}));
