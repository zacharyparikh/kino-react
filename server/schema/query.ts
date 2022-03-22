import { queryType } from 'nexus';

const Query = queryType({
  definition(t) {
    t.list.field('allUsers', {
      type: 'User',
      resolve: (_source, _args, { prisma }) => prisma.users.findMany(),
    });
  },
});

export default Query;
