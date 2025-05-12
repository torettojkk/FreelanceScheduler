import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, UserRole } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Check if the stored password contains a salt (indicated by a period)
  if (!stored.includes(".")) {
    // For test accounts that don't have hashed passwords
    return supplied === stored;
  }
  
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "agendahub-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 86400000, // 24 hours
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Custom fields for email/password
  const customFields = {
    usernameField: 'email',
    passwordField: 'password',
  };

  passport.use(
    new LocalStrategy(
      customFields,
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Email ou senha incorretos" });
          }
          
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      
      // Validate required fields
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }
      
      // Check if email is already registered
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Este email já está em uso" });
      }
      
      // Check if role is valid
      const validRoles: UserRole[] = ["admin", "owner", "client"];
      if (!validRoles.includes(role as UserRole)) {
        return res.status(400).json({ message: "Tipo de usuário inválido" });
      }
      
      // Create user with hashed password
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: role as UserRole,
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Login the user
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Erro ao registrar usuário" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Credenciais inválidas" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Não autenticado" });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}
