import { Request } from "express";

export interface UserType {
  google_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  profile_pic: string;
  time_added: number;
}

export interface UserCollection {
  google_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  profile_pic: string;
  time_added: number;
  _id: string;
}

export interface InviteCodeCollection {
  code: string,
  time_added: number,
  max_users: number,
  duration: number,
  _id: string;
}

export interface SubscriptionsCollection {
  user_id: string,
  duration: number,
  time_added: number,
  renew: number,
  code: string,
  status: string,
  subscription_id: string,
  payment: any,
  _id: string;
}


export interface LoggedInUserType {
  google_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  profile_pic: string;
  time_added: number;
  token: string;
}

export interface TokenType {
  user_id: string;
  token: string;
  time_added: number;
  token_id: string;
}

export interface AuthRequest extends Request {
  user: UserType | false;
  error: string | false;
}


export interface CollectionType {
  collection_id: string;
  name: string;
  user_id: string,
  time_added: number,
  visibilty: string
}

export interface CollectedPhoto {
  collection_id: string;
  photo_id: string;
  user_id: string,
  thumbnail: string,
  time_added: number,
}

export interface LikedPhoto {
  photo_id: string;
  user_id: string,
  thumbnail: string,
  time_added: number,
}

export interface AIChat {
  chat_id: string,
  user_id: string,
  time_added: number
  title: string
}

export interface AIMessageImage {
  pexai_id: string,
  origin: string,
  url: string,
  thumbnail: string
}

export interface AIMessage {
  chat_id: string,
  status: string,
  user_id: string,
  time_added: number,
  message_id: string,
  text: string,
  role: string
  images: Array<AIMessageImage> | Array<any>
}