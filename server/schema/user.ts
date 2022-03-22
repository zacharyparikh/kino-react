import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { hash } from 'bcryptjs';
import {
  mutationField,
  nonNull,
  objectType, stringArg,
} from 'nexus';
import { signAccessToken } from '../auth';
import MutationResponse from './mutation';
import UNIQUE_CONSTRAINT_VIOLATION from './unique-constraint';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.int('id');
    t.date('createdAt');
    t.string('email');
    t.string('password');
  },
});

const CreateUserMutationResponse = objectType({
  name: 'CreateUserMutationResponse',
  definition(t) {
    t.implements(MutationResponse);
    t.string('email');
    t.string('token');
  },
});

export const createUser = mutationField('createUser', {
  type: CreateUserMutationResponse,
  args: {
    email: nonNull(stringArg()),
    password: nonNull(stringArg()),
  },
  async resolve(_source, { email, password }, { prisma }) {
    const tokenPromise = signAccessToken({ email });
    try {
      await prisma.users.create({
        data: {
          email,
          password: await hash(password, 12),
        },
      });

      return {
        code: 201,
        success: true,
        message: `User with email ${email} created successfully`,
        email,
        token: await tokenPromise,
      };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === UNIQUE_CONSTRAINT_VIOLATION) {
        return {
          code: 409,
          success: false,
          message: `Email ${email} already exists`,
        };
      }
      throw e;
    }
  },
});
