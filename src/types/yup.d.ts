// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ArraySchema } from 'yup';

declare module 'yup' {
  interface ArraySchema<T> {
    distinct(mapper?: (v: any) => any, message?: string): ArraySchema<T>;
  }
}
