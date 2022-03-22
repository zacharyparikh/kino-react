import dotenv from 'dotenv';
import { sign, verify } from 'jsonwebtoken';

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

if (!accessTokenSecret) {
  throw new Error('ACCESS_TOKEN_SECRET undefined');
}

export const signAccessToken = (payload: string | object | Buffer): Promise<string> => (
  new Promise((resolve, reject) => {
    sign(payload, accessTokenSecret, (err, token) => {
      if (err) {
        reject(err);
        return;
      }

      if (token === undefined) {
        reject(new Error('Token is undefined'));
        return;
      }

      resolve(token);
    });
  })
);

export const verifyAccessToken = (token: string): Promise<string | object> => (
  new Promise((resolve, reject) => {
    verify(token, accessTokenSecret, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }

      if (decoded === undefined) {
        reject(new Error('Could not decode token'));
        return;
      }

      resolve(decoded);
    });
  })
);
