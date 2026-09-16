import { Chrome, Globe, Laptop, Smartphone } from "lucide-react";

import { Session } from "better-auth";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { UAParser } from "ua-parser-js";

export interface FormattedSession {
  id: string;
  token: string;
  device: string;
  icon: React.ElementType;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export function formatSessions(
  rawSessions: Session[],
  currentToken: string
): FormattedSession[] {
  return rawSessions.map((session) => {
    const parser = new UAParser(session.userAgent || "");
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    let Icon = Globe;
    if (device.type === "mobile" || device.type === "tablet") Icon = Smartphone;
    else if (os.name?.includes("Windows") || os.name?.includes("Mac"))
      Icon = Laptop;
    else if (browser.name?.includes("Chrome")) Icon = Chrome;

    const deviceName = `${browser.name || "Navegador"} en ${
      os.name || "Desconocido"
    }`;

    const timeAgo = formatDistanceToNow(new Date(session.createdAt), {
      addSuffix: true,
      locale: es,
    });

    return {
      id: session.id,
      token: session.token,
      device: deviceName,
      icon: Icon,
      location: session.ipAddress || "Ubicación desconocida",
      lastActive: timeAgo,
      isCurrent: session.token === currentToken,
    };
  });
}
