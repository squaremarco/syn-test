import { NextFunction, Request, Response } from 'express';
import { AnySchema, ValidationError } from 'yup';

export const errorHandler = (err: Error, _: Request, res: Response) => res.status(500).send({ error: err.message });

export const yupValidateMiddleware = (schema: AnySchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params
    });

    return next();
  } catch (err: any) {
    if (ValidationError.isError(err)) {
      return res.status(500).send({ type: err.name, message: err.message });
    }

    return res.status(500).send({ type: 'ExceptionalError', message: err.message });
  }
};
