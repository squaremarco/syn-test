import pino from 'pino';

const transport = () => pino.transport({ target: 'pino-pretty' });

export const pinoli = pino(
  { base: undefined },
  pino.multistream(
    [
      { level: 'info', stream: transport() },
      { level: 'error', stream: transport() }
    ],
    { dedupe: true }
  )
);
