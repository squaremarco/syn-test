import { isEmpty, isNil } from 'ramda';
import * as yup from 'yup';

yup.addMethod(yup.array, 'distinct', function distinctFn(mapper = (a: any) => a, message?: string) {
  return this.test('distinct', function testFn(list) {
    return isNil(list) || isEmpty(list) || list?.length === new Set(list?.map(mapper)).size
      ? true
      : this.createError({ path: this.path, message: `${this.path} ${message ?? 'should have distinct values'}` });
  });
});
