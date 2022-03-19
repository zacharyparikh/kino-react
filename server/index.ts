import dotenv from 'dotenv';
import express, { Handler } from 'express';
import { ApolloServer } from 'apollo-server';
import { makeSchema } from 'nexus';
import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { join } from 'path';
import prisma from './db';
import * as types from './schema';

dotenv.config();

const schema = makeSchema({
  types,
  outputs: {
    typegen: join(__dirname, 'nexus-typegen.ts'),
    schema: join(__dirname, 'schema.graphql'),
  },
});

const server = new ApolloServer({ schema });
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

if (accessTokenSecret === undefined) {
  throw new Error('Access Token Secret Not Found');
}

const authenticateToken: Handler = async (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization === undefined) {
    return res.sendStatus(401);
  }

  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return res.status(401).send('Bearer token required');
  }

  return verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      const message = err.name === 'JsonWebTokenError'
        ? 'Unauthorized'
        : err.message;

      res.status(401).send(message);
    }

    req.body.user = user;
    next();
  });
};

app.use(express.json());
app.get('/', authenticateToken);

app.post('/api/createUser', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    res.send('Invalid Parameters');
  }

  const hashedPassword = await hash(password, 12);

  await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  const token = sign(
    { email },
    accessTokenSecret,
    { expiresIn: '1h' },
  );

  res.status(201).json(token);
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    res.send('Invalid Parameters');
  }

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
    select: {
      password: true,
    },
  });

  if (user === null) {
    return res.status(401).send(`${email} not registered`);
  }

  const { password: hashedPassword } = user;
  const isAuthorized = await compare(password, hashedPassword);

  if (isAuthorized) {
    return res.send('Logged In');
  }

  return res.status(401).send('Incorrect password');
});
