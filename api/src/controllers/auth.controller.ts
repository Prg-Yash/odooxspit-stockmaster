import type { Request, Response } from "express";
import { AuthTypes } from "../types/auth.types";

export async function register(req: Request, res: Response) {
  const { success, data } = AuthTypes.SRegister.safeParse(req.body);

  if (!success)
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });

  
}
