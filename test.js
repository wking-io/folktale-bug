import Result from 'folktale/result';

const maybeNull = x => (x ? 'success' : null);

const testFunction = val => Result.fromNullable(maybeNull(val));

export default testFunction;
