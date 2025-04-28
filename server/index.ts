import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage, DatabaseStorage } from "./storage";
import memorystore from "memorystore";
import path from "path";
import { initializeDatabase } from './db/init';
import os from 'os';

// Função para obter o IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Configuração da sessão
const MemoryStore = memorystore(session);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware para lidar com favicon.ico
app.get('/favicon.ico', (req, res) => {
  res.status(200).send();
});

// Configuração da sessão
app.use(session({
  secret: "real-estate-manager-secret",
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // limpa sessões expiradas a cada 24h
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Inicialização do passport
app.use(passport.initialize());
app.use(passport.session());

// Configuração da estratégia local
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await storage.validateUser(username, password);
    
    if (!user) {
      return done(null, false, { message: "Usuário ou senha inválidos" });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialização e desserialização do usuário
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Inicializar banco de dados
    log('Iniciando banco de dados...');
    await initializeDatabase();
    log('Banco de dados inicializado com sucesso');
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error("Erro detalhado:", {
        status,
        message,
        stack: err.stack,
        path: _req.path,
        method: _req.method
      });

      res.status(status).json({ 
        message,
        status,
        path: _req.path
      });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    const host = '0.0.0.0'; // Permite conexões de qualquer IP
    
    server.listen({
      port,
      host,
      reusePort: true,
    }, () => {
      const localIP = getLocalIP();
      log(`Servidor rodando em:`);
      log(`- Local: http://localhost:${port}`);
      log(`- Rede: http://${localIP}:${port}`);
      log(`Acessível em outros dispositivos via IP local`);
    });
  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error);
    process.exit(1);
  }
})();
