const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "HealthyApp API",
    version: "1.0.0",
    description: "API para autenticacion, registro de entradas de peso/altura e inspeccion administrativa.",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Servidor local de desarrollo",
    },
  ],
  tags: [
    { name: "Auth", description: "Autenticacion y politica de password" },
    { name: "Entries", description: "Registro y consulta de peso y altura" },
    { name: "Admin", description: "Operaciones reservadas para administradores" },
    { name: "Health", description: "Estado del servicio" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Error interno del servidor" },
        },
        required: ["error"],
      },
      PasswordPolicy: {
        type: "object",
        properties: {
          minLength: { type: "integer", example: 12 },
          maxLength: { type: "integer", example: 128 },
          allowLower: { type: "boolean", example: true },
          allowUpper: { type: "boolean", example: true },
          allowDigits: { type: "boolean", example: true },
          allowSymbols: { type: "boolean", example: true },
          requireLower: { type: "boolean", example: true },
          requireUpper: { type: "boolean", example: true },
          requireDigits: { type: "boolean", example: true },
          requireSymbols: { type: "boolean", example: true },
        },
        required: [
          "minLength",
          "maxLength",
          "allowLower",
          "allowUpper",
          "allowDigits",
          "allowSymbols",
          "requireLower",
          "requireUpper",
          "requireDigits",
          "requireSymbols",
        ],
      },
      AuthRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "usuario@example.com" },
          password: { type: "string", format: "password", example: "Password123!" },
          captchaToken: { type: "string", example: "captcha-token-opcional" },
        },
        required: ["email", "password"],
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          email: { type: "string", format: "email", example: "usuario@example.com" },
          role: { type: "string", example: "user" },
        },
        required: ["id", "email", "role"],
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          user: { $ref: "#/components/schemas/User" },
        },
        required: ["token", "user"],
      },
      EntryRequest: {
        type: "object",
        properties: {
          weight: { type: "number", format: "float", example: 72.4 },
          height: { type: "number", format: "float", example: 1.78 },
        },
        required: ["weight", "height"],
      },
      Entry: {
        type: "object",
        properties: {
          id: { type: "integer", example: 7 },
          weight: { type: "number", format: "float", example: 72.4 },
          height: { type: "number", format: "float", example: 1.78 },
          created_at: { type: "string", format: "date-time", example: "2026-03-18T14:30:00.000Z" },
        },
        required: ["id", "weight", "height", "created_at"],
      },
      AdminUser: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "admin@example.com" },
          role: { type: "string", example: "admin" },
        },
        required: ["email", "role"],
      },
      HealthStatus: {
        type: "object",
        properties: {
          ok: { type: "boolean", example: true },
        },
        required: ["ok"],
      },
    },
  },
  paths: {
    "/api/auth/policy": {
      get: {
        tags: ["Auth"],
        summary: "Obtener la politica de password activa",
        responses: {
          200: {
            description: "Politica de password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PasswordPolicy" },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar un nuevo usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Usuario registrado correctamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: {
            description: "Datos invalidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Email ya registrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Error interno",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesion",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Sesion iniciada correctamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: {
            description: "Datos invalidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Credenciales invalidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          429: {
            description: "Cuenta bloqueada temporalmente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/entries": {
      get: {
        tags: ["Entries"],
        summary: "Listar entradas del usuario autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Listado de entradas",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Entry" },
                },
              },
            },
          },
          401: {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Entries"],
        summary: "Crear una nueva entrada de peso y altura",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EntryRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Entrada creada correctamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Entry" },
              },
            },
          },
          400: {
            description: "Valores invalidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Error interno",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "Listar usuarios para administradores",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Usuarios del sistema",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/AdminUser" },
                },
              },
            },
          },
          401: {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Acceso denegado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Comprobar el estado del servicio",
        responses: {
          200: {
            description: "Servicio operativo",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthStatus" },
              },
            },
          },
        },
      },
    },
  },
};

export default openApiSpec;
