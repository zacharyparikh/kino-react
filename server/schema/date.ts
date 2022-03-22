import { Kind } from 'graphql';
import { scalarType } from 'nexus';

const DateScalar = scalarType({
  name: 'Date',
  asNexusMethod: 'date',
  description: 'Date custom scalar type',
  parseValue(value) {
    if (typeof value !== 'number' && typeof value !== 'string') {
      throw new Error(`Could not parse Date from ${value}`);
    }
    return new Date(value);
  },
  serialize(value) {
    if (!(value instanceof Date)) {
      throw new Error(`Cannot serialize ${value}`);
    }
    return value.getTime();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }

    return null;
  },

});

export default DateScalar;
