import { type Request, type Response, type NextFunction } from "express";

type SessionData = Record<string, unknown>;

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = req.session as unknown as SessionData;
  if (!session["adminId"]) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = req.session as unknown as SessionData;
  if (!session["adminId"]) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (session["adminRole"] !== "super_admin") {
    res.status(403).json({ error: "Forbidden: super_admin role required" });
    return;
  }
  next();
}
