import { objectType } from 'nexus';

const User = objectType({
  name: 'User',
  definition(t) {
    t.string('email');
    t.string('password');
  },
});

export default User;
