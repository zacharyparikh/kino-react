import { queryType } from 'nexus';
import prisma from '../db';

const Query = queryType({
  definition(t) {
    t.list.field('allUsers', {
      type: 'User',
      resolve: () => prisma.users.findMany(),
    });
  },
});

export default Query;
