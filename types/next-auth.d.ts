import { DefaultSession } from "next-auth"

type ThemeColor = "CYAN" | "BLUE" | "GREEN" | "ORANGE" | "RED" | "PINK" | "PURPLE"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      identifier: string
      themeColor: ThemeColor
    } & DefaultSession["user"]
  }

  interface User {
    identifier: string
    themeColor: ThemeColor
  }
}
