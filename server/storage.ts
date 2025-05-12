import { 
  users, type User, type InsertUser,
  businesses, type Business, type InsertBusiness,
  services, type Service, type InsertService,
  appointments, type Appointment, type InsertAppointment,
  notifications, type Notification, type InsertNotification,
  businessSettings, type UserRole
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Business methods
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessBySlug(slug: string): Promise<Business | undefined>;
  getBusinessesByStatus(status: string): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<Business>): Promise<Business | undefined>;
  incrementBusinessAppointmentCount(id: number): Promise<void>;
  
  // Service methods
  getService(id: number): Promise<Service | undefined>;
  getServicesByBusiness(businessId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByClient(clientId: number): Promise<Appointment[]>;
  getAppointmentsByBusiness(businessId: number): Promise<Appointment[]>;
  getAppointmentsByStatus(status: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  
  // Notification methods
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private businesses: Map<number, Business>;
  private services: Map<number, Service>;
  private appointments: Map<number, Appointment>;
  private notifications: Map<number, Notification>;
  private settings: Map<number, any>;
  
  private nextUserId: number;
  private nextBusinessId: number;
  private nextServiceId: number;
  private nextAppointmentId: number;
  private nextNotificationId: number;
  private nextSettingId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.businesses = new Map();
    this.services = new Map();
    this.appointments = new Map();
    this.notifications = new Map();
    this.settings = new Map();
    
    this.nextUserId = 1;
    this.nextBusinessId = 1;
    this.nextServiceId = 1;
    this.nextAppointmentId = 1;
    this.nextNotificationId = 1;
    this.nextSettingId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h in ms
    });
    
    // Create initial admin user
    this.createUser({
      name: "Admin User",
      email: "admin@agendahub.com",
      password: "admin123", // Will be hashed in auth.ts
      role: "admin"
    });
    
    // Create initial business owner
    const ownerId = this.nextUserId;
    this.createUser({
      name: "Business Owner",
      email: "owner@agendahub.com",
      password: "owner123", // Will be hashed in auth.ts
      role: "owner"
    });
    
    // Create initial business
    const businessId = this.nextBusinessId;
    this.createBusiness({
      name: "Barbearia Silva",
      ownerName: "João Silva",
      email: "contato@barbearia-silva.com",
      phone: "(11) 98765-4321",
      type: "barber",
      address: "Av. Paulista, 1000 - São Paulo/SP",
      description: "A melhor barbearia da cidade",
      urlSlug: "barbearia-silva",
      status: "active",
    });
    
    // Update owner with business ID
    this.users.set(ownerId, {
      ...this.users.get(ownerId)!,
      businessId,
    });
    
    // Create initial services
    this.createService({
      name: "Corte de Cabelo",
      price: 5000, // R$ 50.00
      duration: 30,
      description: "Corte moderno para homens",
      businessId,
    });
    
    this.createService({
      name: "Barba",
      price: 3500, // R$ 35.00
      duration: 20,
      description: "Barba desenhada com toalha quente",
      businessId,
    });
    
    // Create initial client
    const clientId = this.nextUserId;
    this.createUser({
      name: "Client User",
      email: "client@example.com",
      password: "client123", // Will be hashed in auth.ts
      role: "client"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  // Business methods
  async getBusiness(id: number): Promise<Business | undefined> {
    return this.businesses.get(id);
  }
  
  async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    return Array.from(this.businesses.values()).find(
      (business) => business.urlSlug === slug,
    );
  }
  
  async getBusinessesByStatus(status: string): Promise<Business[]> {
    return Array.from(this.businesses.values()).filter(
      (business) => business.status === status,
    );
  }
  
  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = this.nextBusinessId++;
    
    // Generate URL slug if not provided
    let urlSlug = insertBusiness.urlSlug;
    if (!urlSlug) {
      urlSlug = insertBusiness.name.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
        
      // Check if slug already exists and add numeric suffix if needed
      let baseSlug = urlSlug;
      let counter = 1;
      while (await this.getBusinessBySlug(urlSlug)) {
        urlSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
    
    const business: Business = { 
      ...insertBusiness, 
      id, 
      urlSlug,
      createdAt: new Date(),
      appointmentCount: 0,
      isPremium: false,
      status: "active"
    };
    
    this.businesses.set(id, business);
    return business;
  }
  
  async updateBusiness(id: number, businessData: Partial<Business>): Promise<Business | undefined> {
    const business = this.businesses.get(id);
    if (!business) return undefined;
    
    const updatedBusiness = { ...business, ...businessData };
    this.businesses.set(id, updatedBusiness);
    return updatedBusiness;
  }
  
  async incrementBusinessAppointmentCount(id: number): Promise<void> {
    const business = await this.getBusiness(id);
    if (business) {
      const updatedBusiness = { 
        ...business, 
        appointmentCount: (business.appointmentCount || 0) + 1 
      };
      this.businesses.set(id, updatedBusiness);
    }
  }
  
  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getServicesByBusiness(businessId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.businessId === businessId,
    );
  }
  
  async createService(insertService: InsertService): Promise<Service> {
    const id = this.nextServiceId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }
  
  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...serviceData };
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }
  
  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByClient(clientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.clientId === clientId,
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  async getAppointmentsByBusiness(businessId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.businessId === businessId,
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  async getAppointmentsByStatus(status: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.status === status,
    );
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.nextAppointmentId++;
    const now = new Date();
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      createdAt: now,
      updatedAt: now,
      status: "pending" 
    };
    
    this.appointments.set(id, appointment);
    
    // Increment business appointment count
    await this.incrementBusinessAppointmentCount(appointment.businessId);
    
    return appointment;
  }
  
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { 
      ...appointment, 
      status, 
      updatedAt: new Date() 
    };
    
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  // Notification methods
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId,
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.nextNotificationId++;
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      read: false,
      createdAt: new Date() 
    };
    
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      const updatedNotification = { ...notification, read: true };
      this.notifications.set(id, updatedNotification);
    }
  }
}

export const storage = new MemStorage();
