import { Db } from "mongodb";
import { LoggedInUserType, UserType } from "../../types";
import { tryCatch } from "../../utils/tryCatch";
import { dbAddNewUser, dbAddNewUserToken } from "../../models/dbUtils";

import jwt from "jsonwebtoken";

import { v4 as uuidv4 } from "uuid";

const jwt_secret = process.env.JWT_SECRET || "";

export const signUpNewUser = async (db: Db, data: UserType) => {
  const { data: addNewUserData, error: addNewUserError } = await tryCatch(
    dbAddNewUser(db, data),
  );
  if (addNewUserError) {
    throw addNewUserError;
  }

  return addNewUserData;
};

export const loginUser = async (
  db: Db,
  data: UserType,
): Promise<LoggedInUserType> => {
  const token = jwt.sign(data, jwt_secret, {
    expiresIn: "30d",
  });

  const newToken = {
    token_id: uuidv4(),
    token: token,
    user_id: data.user_id,
    time_added: Date.now(),
  };

  const { data: addTokenData, error: addTokenError } = await tryCatch(
    dbAddNewUserToken(db, newToken),
  );

  if (addTokenError) {
    throw addTokenError;
  }

  const payload = {
    ...data,
    token: token,
  };

  return payload;
};
