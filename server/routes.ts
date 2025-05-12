import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { format, parse, addDays } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Business routes
  app.get("/api/businesses", async (req, res) => {
    try {
      const status = req.query.status as string || "active";
      const businesses = await storage.getBusinessesByStatus(status);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Erro ao buscar estabelecimentos" });
    }
  });
  
  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const business = await storage.getBusiness(id);
      if (!business) {
        return res.status(404).json({ message: "Estabelecimento não encontrado" });
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Erro ao buscar estabelecimento" });
    }
  });
  
  app.get("/api/businesses/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const business = await storage.getBusinessBySlug(slug);
      
      if (!business) {
        return res.status(404).json({ message: "Estabelecimento não encontrado" });
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error fetching business by slug:", error);
      res.status(500).json({ message: "Erro ao buscar estabelecimento" });
    }
  });
  
  app.post("/api/businesses", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const { name, ownerName, email, phone, type, address, description } = req.body;
      
      if (!name || !ownerName || !email || !type) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes" });
      }
      
      // Create URL slug from name
      const urlSlug = name.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      const business = await storage.createBusiness({
        name,
        ownerName,
        email,
        phone,
        type,
        address,
        description,
        urlSlug,
        status: "active",
      });
      
      res.status(201).json(business);
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Erro ao criar estabelecimento" });
    }
  });
  
  app.patch("/api/businesses/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const { name, ownerName, email, phone, type, address, description, status, isPremium } = req.body;
      
      // Check if business exists
      const existingBusiness = await storage.getBusiness(id);
      if (!existingBusiness) {
        return res.status(404).json({ message: "Estabelecimento não encontrado" });
      }
      
      // Update business
      const updatedBusiness = await storage.updateBusiness(id, {
        ...(name && { name }),
        ...(ownerName && { ownerName }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(type && { type }),
        ...(address !== undefined && { address }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(isPremium !== undefined && { isPremium }),
      });
      
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Erro ao atualizar estabelecimento" });
    }
  });
  
  app.delete("/api/businesses/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      // Check if business exists
      const existingBusiness = await storage.getBusiness(id);
      if (!existingBusiness) {
        return res.status(404).json({ message: "Estabelecimento não encontrado" });
      }
      
      // We should add a method to delete business in storage
      // For now, we can update the status to "inactive"
      const updatedBusiness = await storage.updateBusiness(id, {
        status: "inactive",
      });
      
      res.json({ success: true, message: "Estabelecimento removido com sucesso" });
    } catch (error) {
      console.error("Error deleting business:", error);
      res.status(500).json({ message: "Erro ao remover estabelecimento" });
    }
  });
  
  // Service routes
  app.get("/api/businesses/:businessId/services", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      if (isNaN(businessId)) {
        return res.status(400).json({ message: "ID de estabelecimento inválido" });
      }
      
      const services = await storage.getServicesByBusiness(businessId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Erro ao buscar serviços" });
    }
  });
  
  app.post("/api/services", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "owner") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const { name, price, duration, description, businessId } = req.body;
      
      if (!name || price === undefined || !duration || !businessId) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes" });
      }
      
      // Check if the user is the owner of the business
      if (req.user.businessId !== businessId) {
        return res.status(403).json({ message: "Você não tem permissão para adicionar serviços a este estabelecimento" });
      }
      
      const service = await storage.createService({
        name,
        price,
        duration,
        description,
        businessId,
      });
      
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Erro ao criar serviço" });
    }
  });
  
  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      let appointments = [];
      
      if (req.user.role === "client") {
        appointments = await storage.getAppointmentsByClient(req.user.id);
      } else if (req.user.role === "owner") {
        if (!req.user.businessId) {
          return res.status(400).json({ message: "Usuário não associado a um estabelecimento" });
        }
        appointments = await storage.getAppointmentsByBusiness(req.user.businessId);
      } else if (req.user.role === "admin") {
        const businessId = parseInt(req.query.businessId as string);
        if (!isNaN(businessId)) {
          appointments = await storage.getAppointmentsByBusiness(businessId);
        } else {
          return res.status(400).json({ message: "Admin deve especificar um businessId" });
        }
      }
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Erro ao buscar agendamentos" });
    }
  });
  
  app.post("/api/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const { serviceId, date, notes } = req.body;
      
      if (!serviceId || !date) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes" });
      }
      
      // Parse date
      let appointmentDate;
      try {
        if (typeof date === 'string') {
          const [dateStr, timeStr] = date.split('T');
          appointmentDate = new Date(`${dateStr}T${timeStr || '00:00:00'}`);
        } else {
          appointmentDate = new Date(date);
        }
      } catch (err) {
        return res.status(400).json({ message: "Formato de data inválido" });
      }
      
      // Get service to find businessId
      const service = await storage.getService(parseInt(serviceId));
      if (!service) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }
      
      const businessId = service.businessId;
      
      // For owner, verify if they own the business
      if (req.user.role === "owner" && req.user.businessId !== businessId) {
        return res.status(403).json({ message: "Você não tem permissão para criar agendamentos para este estabelecimento" });
      }
      
      // Determine clientId based on role
      let clientId: number;
      
      if (req.user.role === "client") {
        // Client is creating their own appointment
        clientId = req.user.id;
      } else if (req.body.clientId) {
        // Owner is creating an appointment for a client
        clientId = parseInt(req.body.clientId);
      } else {
        return res.status(400).json({ message: "ID do cliente é obrigatório para agendamentos criados por estabelecimentos" });
      }
      
      // Check if business has reached free plan limit
      const business = await storage.getBusiness(businessId);
      if (business && !business.isPremium && business.appointmentCount >= 50) {
        return res.status(403).json({ message: "Limite de agendamentos gratuitos atingido. Por favor, faça upgrade para o plano premium." });
      }
      
      const appointment = await storage.createAppointment({
        serviceId: parseInt(serviceId),
        businessId,
        clientId,
        date: appointmentDate,
        notes,
      });
      
      // Create notification for the client
      await storage.createNotification({
        userId: clientId,
        title: "Novo agendamento criado",
        message: `Seu agendamento para ${format(appointmentDate, "dd/MM/yyyy 'às' HH:mm")} foi criado.`,
        type: "appointment_created",
        appointmentId: appointment.id,
      });
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Erro ao criar agendamento" });
    }
  });
  
  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status é obrigatório" });
      }
      
      // Validate status value
      const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }
      
      // Get appointment to check permissions
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Agendamento não encontrado" });
      }
      
      // Check permissions based on role and status change
      if (req.user.role === "client") {
        // Clients can only confirm or cancel their own appointments
        if (appointment.clientId !== req.user.id) {
          return res.status(403).json({ message: "Você não tem permissão para alterar este agendamento" });
        }
        
        if (status !== "confirmed" && status !== "cancelled") {
          return res.status(403).json({ message: "Clientes só podem confirmar ou cancelar agendamentos" });
        }
      } else if (req.user.role === "owner") {
        // Owners can only update appointments for their business
        if (appointment.businessId !== req.user.businessId) {
          return res.status(403).json({ message: "Você não tem permissão para alterar este agendamento" });
        }
      }
      
      const updatedAppointment = await storage.updateAppointmentStatus(id, status);
      
      // Create notification for status change
      let notificationTitle = "";
      let notificationMessage = "";
      
      switch (status) {
        case "confirmed":
          notificationTitle = "Agendamento confirmado";
          notificationMessage = `Seu agendamento para ${format(appointment.date, "dd/MM/yyyy 'às' HH:mm")} foi confirmado.`;
          break;
        case "cancelled":
          notificationTitle = "Agendamento cancelado";
          notificationMessage = `Seu agendamento para ${format(appointment.date, "dd/MM/yyyy 'às' HH:mm")} foi cancelado.`;
          break;
        case "completed":
          notificationTitle = "Serviço concluído";
          notificationMessage = `Seu serviço agendado para ${format(appointment.date, "dd/MM/yyyy 'às' HH:mm")} foi concluído.`;
          break;
      }
      
      // Create notification for the appropriate user
      if (notificationTitle) {
        // If client updated, notify business owner, and vice versa
        const notifyUserId = req.user.role === "client" 
          ? (await storage.getBusiness(appointment.businessId))?.id 
          : appointment.clientId;
        
        await storage.createNotification({
          userId: notifyUserId!,
          title: notificationTitle,
          message: notificationMessage,
          type: `appointment_${status}`,
          appointmentId: appointment.id,
        });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Erro ao atualizar status do agendamento" });
    }
  });
  
  // User management routes (admin only)
  app.get("/api/users", async (req, res) => {
    try {
      // Require admin permissions
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      // Fetch all users
      const users = Array.from(storage.getUsers().values()).map(user => {
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });
  
  app.get("/api/users/:id", async (req, res) => {
    try {
      // Require admin permissions
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  });
  
  app.patch("/api/users/:id", async (req, res) => {
    try {
      // Require admin permissions
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const { name, email, password, role } = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Create update data
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      
      // If password is provided, use it directly for now
      // In a real app, we would hash it first
      if (password) {
        updateData.password = password;
      }
      
      // Update user
      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(500).json({ message: "Erro ao atualizar usuário" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  });
  
  app.delete("/api/users/:id", async (req, res) => {
    try {
      // Require admin permissions
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Check if it's the user's own account
      if (id === req.user.id) {
        return res.status(400).json({ message: "Não é possível remover sua própria conta" });
      }
      
      // Delete user
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(500).json({ message: "Erro ao remover usuário" });
      }
      
      res.json({ success: true, message: "Usuário removido com sucesso" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Erro ao remover usuário" });
    }
  });
  
  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Erro ao buscar notificações" });
    }
  });
  
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      await storage.markNotificationAsRead(id);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Erro ao marcar notificação como lida" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
