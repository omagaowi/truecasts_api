import { NextFunction, Request, Response } from "express";
import dbConnector from "../models/db";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        user: any;
        error: string | boolean;
      };
    }
  }
}

const { getDb } = dbConnector;
import "dotenv/config";
import { tryCatch } from "../utils/tryCatch";
import { dbFindToken, dbFindUserByUserID } from "../models/dbUtils";
import { UserType } from "../types";

const jwt_secret = process.env.JWT_SECRET || "";

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
     const db = getDb();
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.auth = {
      user: false,
      error: "Unauthorized User",
    };
    return next();
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    req.auth = {
      user: false,
      error: "Malformed Access Token",
    };
    return next();
  }
  const token = parts[1];

  if (!token) {
    req.auth = {
      user: false,
      error: "Malformed Access Token",
    };
  }

  const { data: tokenData, error: tokenError } = await tryCatch(
    dbFindToken(db, token)
  );

  if (tokenError) {
    req.auth = {
      user: false,
      error: tokenError.message,
    };
    return next();
  }

  const decoded = jwt.verify(token, jwt_secret) as jwt.JwtPayload;

  if (typeof decoded !== "object" || decoded === null) {
    req.auth = {
      user: false,
      error: "Invalid Access Token",
    };
    return next();
  }

  const { exp, iat, ...authUser } = decoded;

  const user = authUser as UserType;

  if (!decoded) {
    req.auth = {
      user: false,
      error: "No user Found",
    };
    return next();
  }

  const { data: userData, error: userError } = await tryCatch(
    dbFindUserByUserID(db, user.user_id)
  );

  if (userError) {
    req.auth = {
      user: false,
      error: userError.message,
    };
    return next();
  }

  req.auth = {
    user: userData,
    error: false,
  };

  return next();
  } catch (error : any) {
     req.auth = {
    user: new Error(error),
    error: false,
  };
  }
   return next();
};

export { authenticateUser };
