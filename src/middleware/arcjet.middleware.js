import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);

    if (decision.conclusion === "DENY") {
      const reason = decision.reason;

      if (reason?.type === "RATE_LIMIT") {
        return res.status(429).json({ message: "Too many requests" });
      }

      if (reason?.type === "BOT") {
        return res.status(403).json({ message: "Bot blocked" });
      }

      return res.status(403).json({ message: "Access denied" });
    }

    if (decision.results?.some(isSpoofedBot)) {
      return res.status(403).json({ message: "Spoofed bot detected" });
    }

    next();
  } catch (err) {
    console.error("Arcjet error:", err);
    next();
  }
};



