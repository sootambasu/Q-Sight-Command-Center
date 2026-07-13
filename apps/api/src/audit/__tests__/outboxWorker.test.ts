import { processOutboxBatch } from '../outboxWorker';
import { pool } from '../../db';
import { exportHttps } from '../exporters/httpsExporter';
import { config } from '../../config';

jest.mock('../../db', () => ({
  pool: {
    connect: jest.fn(),
  },
}));

jest.mock('../exporters/httpsExporter', () => ({
  exportHttps: jest.fn(),
}));

jest.mock('../../config', () => ({
  config: { buildProfile: 'production' },
}));

describe('Audit Outbox Worker', () => {
  let clientMock: any;

  beforeEach(() => {
    clientMock = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (pool!.connect as jest.Mock).mockResolvedValue(clientMock);
    jest.clearAllMocks();
  });

  it('processes events successfully', async () => {
    clientMock.query.mockResolvedValueOnce({
      rows: [
        { id: '1', event_payload: { action: 'test' }, retry_count: 0 }
      ]
    });
    (exportHttps as jest.Mock).mockResolvedValueOnce(undefined);

    await processOutboxBatch();

    expect(exportHttps).toHaveBeenCalledWith({ action: 'test' });
    expect(clientMock.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE audit_outbox SET status = 'processed'"),
      ['1']
    );
  });

  it('handles retry and backpressure/failure', async () => {
    clientMock.query.mockResolvedValueOnce({
      rows: [
        { id: '2', event_payload: { action: 'fail' }, retry_count: 0 }
      ]
    });
    (exportHttps as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await processOutboxBatch();

    expect(clientMock.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE audit_outbox SET status = $1, retry_count = $2, error_message = $3'),
      ['failed', 1, 'Network error', '2']
    );
  });

  it('moves to dead-letter queue after max retries', async () => {
    clientMock.query.mockResolvedValueOnce({
      rows: [
        { id: '3', event_payload: { action: 'fail-max' }, retry_count: 2 }
      ]
    });
    (exportHttps as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await processOutboxBatch();

    expect(clientMock.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE audit_outbox SET status = $1, retry_count = $2, error_message = $3'),
      ['dead_letter', 3, 'Network error', '3']
    );
  });
});
