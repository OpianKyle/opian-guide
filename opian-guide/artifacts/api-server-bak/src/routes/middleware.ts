import { type Request, type Response, type NextFunction } from "express";

export function requireAdvisor(req: Request, res: Response, next: NextFunction): void {
  const session = req.session as unknown as Record<string, unknown>;
  if (!session["userId"] || session["userRole"] !== "advisor") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
