import { Request, Response } from 'express';

export const errorHandler = (err: Error, _: Request, res: Response) => res.status(500).send({ error: err.message });
