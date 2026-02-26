import jwt from "jsonwebtoken";

export const JWT_ISSUER = "healthyapp";
export const JWT_AUDIENCE = "healthyapp-users";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET queda por definir");
  }
  return secret;
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    {
      expiresIn: "7d",
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }
  );
}

export function auth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) {
      return res.status(401).json({ error: "Token expirado" });
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }
    if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
      return res.status(401).json({ error: "Token invalido" });
    }
    return res.status(401).json({ error: "No autorizado" });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autorizado" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Acceso denegado: rol insuficiente" });
    }
    return next();
  };
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autorizado" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acceso denegado: rol insuficiente" });
    }
    return next();
  };
}
