import { Db } from "mongodb";
import { tryCatch } from "../utils/tryCatch";
import {
  AIChat,
  AIMessage,
  CollectedPhoto,
  CollectionType,
  InviteCodeCollection,
  LikedPhoto,
  SubscriptionsCollection,
  TokenType,
  UserCollection,
  UserType,
} from "../types";
import e from "express";

export const dbFindUserByGoogleID = async (db: Db, google_id: string) => {
  const { data: user, error: userError } = await tryCatch(
    db.collection<UserCollection>("users").findOne({ google_id: google_id }),
  );
  if (userError) {
    throw `Databse Error 1 ${userError}`;
  }
  if (!user) {
    throw new Error("no user found");
  }
  const { _id, ...result } = { ...user };
  return result;
};

export const dbFindUserByUserID = async (db: Db, user_id: string) => {
  const { data: user, error: userError } = await tryCatch(
    db.collection("users").findOne({ user_id: user_id }),
  );
  if (userError) {
    throw `Databse Error 2 ${userError}`;
  }
  if (!user) {
    throw new Error("no user found");
  }
  const { _id, ...result } = { ...user };
  return result;
};

export const dbAddNewUser = async (db: Db, data: UserType) => {
  const { data: user, error: userError } = await tryCatch(
    dbFindUserByGoogleID(db, data.google_id),
  );

  if (userError?.message != "no user found") {
    throw userError;
  }

  if (user) {
    throw new Error("User with this Google ID already exists");
  }

  const { data: userByID, error: userByIDError } = await tryCatch(
    dbFindUserByUserID(db, data.user_id),
  );

  if (userByIDError?.message != "no user found") {
    throw userByIDError;
  }

  if (userByID) {
    throw new Error("User with this User ID already exists");
  }

  const { data: addUserData, error: addUserError } = await tryCatch(
    db.collection("users").insertOne(data),
  );

  if (addUserError) {
    throw new Error(
      `Database Error 3: ${addUserError.message || addUserError}`,
    );
  }

  return addUserData; // Optionally return the inserted record info
};

export const dbFindTokensByUserId = async (
  db: Db,
  user_id: string,
): Promise<Array<TokenType>> => {
  try {
    const tokens = await db.collection("tokens").find({ user_id: user_id });
    const result = await tokens.toArray();
    const allTokens = result.map((el) => ({
      token: el.token,
      user_id: el.user_id,
      time_added: el.time_added,
      token_id: el.token_id,
    }));
    return allTokens;
  } catch (error) {
    throw `Database Error 4 ${error}`;
  }
};

export const dbFindToken = async (db: Db, token: string) => {
  try {
    const result = db.collection("tokens").findOne({ token: token });
    if (!result) {
      throw new Error("no token found");
    }
    return result;
  } catch (error) {
    throw `Database Error 5 ${error}`;
  }
};

export const dbDeleteTokensByUserID = async (db: Db, user_id: string) => {
  try {
    const result = db.collection("tokens").deleteMany({ user_id: user_id });
    return result;
  } catch (error) {
    throw `Database Error 5 ${error}`;
  }
};

export const dbDeleteToken = async (db: Db, token: string) => {
  try {
    const result = db.collection("tokens").deleteOne({ token: token });
    return result;
  } catch (error) {
    throw error;
  }
};

export const dbAddNewUserToken = async (db: Db, data: TokenType) => {
  const { data: allTokenData, error: allTokenError } = await tryCatch(
    dbFindTokensByUserId(db, data.token),
  );
  if (allTokenError) {
    throw allTokenError;
  }

  if (allTokenData.length == 3) {
    const oldestToken = allTokenData.sort(
      (a, b) => Number(a.time_added) - Number(b.time_added),
    )[0];
    const { data: deleteData, error: deleteError } = await tryCatch(
      dbDeleteToken(db, oldestToken.token),
    );

    if (deleteError) {
      throw deleteError;
    }

    const { data: addTokenData, error: addTokenError } = await tryCatch(
      db.collection("tokens").insertOne(data),
    );

    if (addTokenError) {
      throw `Database Error 6 ${addTokenError}`;
    }

    return addTokenData;
  }

  const { data: addTokenData, error: addTokenError } = await tryCatch(
    db.collection("tokens").insertOne(data),
  );

  if (addTokenError) {
    throw `Database Error 6 ${addTokenError}`;
  }

  return addTokenData;
};
