import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import dbConnector from "../../models/db";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";

const { getDb } = dbConnector;

import "dotenv/config";
import { tryCatch } from "../../utils/tryCatch";
import { dbFindUserByGoogleID } from "../../models/dbUtils";
import { loginUser, signUpNewUser } from "./auth-utils";
import { AuthRequest } from "../../types";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

const googleAuthController = (req: Request, res: Response) => {
  const redirectUri = req.query.redirect_uri as string;
  const authUrl = client.generateAuthUrl({
    scope: ["profile", "email"],
    prompt: "consent",
    redirect_uri: redirectUri,
  });
  res.json({ url: authUrl });
};

const signInController = async (req: Request, res: Response) => {
  const db = getDb();
  const code = req.query.code as string;
  const redirectUri = req.query.redirect_uri as string;
  const { data: clientData, error: clientError } = await tryCatch(
    client.getToken({
      code,
      redirect_uri: redirectUri,
    }),
  );
  if (clientError) {
    return res.status(500).send(clientError.message);
  }

  const tokens = clientData?.tokens;

  if (tokens) {
    client.setCredentials(tokens);
  }

  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const { data: getUserInfo, error: getUserInfoError } = await tryCatch(
    oauth2.userinfo.get(),
  );

  if (getUserInfoError) {
    return res.status(500).send(getUserInfoError.message);
  }

  const userInfo = getUserInfo?.data;

  const newUser = {
    user_id: uuidv4(),
    google_id: userInfo?.id || "",
    email: userInfo?.email || "",
    first_name: userInfo?.given_name || "",
    last_name: userInfo?.family_name || "",
    profile_pic: userInfo?.picture || "",
    time_added: Date.now(),
  };

  const { data: findUserData, error: findUserError } = await tryCatch(
    dbFindUserByGoogleID(db, newUser.google_id || ""),
  );

  if (findUserData) {
    // login user
    const { data: loginData, error: loginError } = await tryCatch(
      loginUser(db, findUserData),
    );

    if (loginError?.message) return res.status(500).send(loginError);

    if (loginData)
      return res.status(200).json({
        ...loginData,
      });
  }

  if (findUserError?.message === "no user found") {
    // sign up & login user
    const { data: signUpData, error: signUpError } = await tryCatch(
      signUpNewUser(db, newUser),
    );

    if (signUpError) return res.status(500).send(signUpError.message);

    const { data: loginData, error: loginError } = await tryCatch(
      loginUser(db, newUser),
    );

    if (loginError) return res.status(500).send(loginError.message);
    if (loginData)
      return res
        .status(200)
        .json({ ...loginData, membership_status: "inactive" });
  }

  // If we got here and still have an error, it’s not “no user found”
  if (findUserError) {
    return res.status(500).send(findUserError.message);
  }
};

const getUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const db = getDb();

  if (req.auth?.error) {
    return res.status(401).json(req.auth.error);
  }

  return res.status(200).json({
    ...req.auth?.user,
  });
};

export { googleAuthController, signInController, getUserController };
