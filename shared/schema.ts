import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User types
export type UserRole = "admin" | "owner" | "client";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<UserRole>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  businessId: integer("business_id").references(() => businesses.id),
});

// Business model
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerName: text("owner_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  type: text("type").notNull(),
  urlSlug: text("url_slug").notNull().unique(),
  address: text("address"),
  logo: text("logo"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").default("pending"),
  appointmentCount: integer("appointment_count").default(0),
  isPremium: boolean("is_premium").default(false),
});

// Service model
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // Stored in cents
  duration: integer("duration").notNull(), // In minutes
  description: text("description"),
  businessId: integer("business_id").notNull().references(() => businesses.id),
});

// Appointment model
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id),
  clientId: integer("client_id").notNull().references(() => users.id),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  status: text("status").default("pending"), // pending, confirmed, cancelled, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notification model
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // appointment reminder, confirmation, cancellation, etc.
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
});

// Business settings model
export const businessSettings = pgTable("business_settings", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  workingHours: json("working_hours").notNull(), // JSON storing open/close times for each day
  unavailableDates: json("unavailable_dates"), // JSON storing vacation/holiday dates
  autoConfirm: boolean("auto_confirm").default(false),
  notificationSettings: json("notification_settings"),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
  role: true,
  businessId: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).pick({
  name: true,
  ownerName: true,
  email: true,
  phone: true,
  type: true,
  address: true,
  logo: true,
  description: true,
});

export const insertServiceSchema = createInsertSchema(services);

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  serviceId: true,
  clientId: true,
  businessId: true,
  date: true,
  notes: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  appointmentId: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
