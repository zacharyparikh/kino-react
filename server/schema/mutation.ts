import { interfaceType } from 'nexus';

const MutationResponse = interfaceType({
  name: 'MutationResponse',
  resolveType(data) {
    if ('email' in data) {
      return 'CreateUserMutationResponse';
    }

    throw new Error(
      'Could not resolve the type of data passed to interface type "MutationResponse"',
    );
  },
  definition(t) {
    t.nonNull.int('code', { description: 'HTTP Status Code' });
    t.nonNull.boolean('success');
    t.nonNull.string('message');
  },
});

export default MutationResponse;
