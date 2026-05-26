/**
 * User model — JSON store backed (dev/test mode)
 * Drop-in replacement for the Mongoose model used in authController.
 */
import { usersDb } from '../utils/jsonStore';

export const User = {
  /** findOne({ email }) */
  findOne: (query: Record<string, any>) => {
    return Promise.resolve(usersDb.findOne(query));
  },

  /** new User({ ... }) + .save() pattern */
  create: (fields: { username: string; email: string; password: string }) => {
    const doc = usersDb.create(fields);
    // Attach .save() so "new User({...}); user.save()" also works
    (doc as any).save = () => Promise.resolve(doc);
    return doc;
  },
};

/** Factory that mimics `new User({ ... })` */
export function createUserDocument(fields: { username: string; email: string; password: string }) {
  let _data = { ...fields };
  let _id: string | null = null;

  return {
    get _id() { return _id; },
    get username() { return _data.username; },
    get email() { return _data.email; },
    get password() { return _data.password; },
    save() {
      const doc = usersDb.create(_data as any);
      _id = doc._id;
      Object.assign(_data, doc);
      return Promise.resolve(doc);
    },
  };
}
