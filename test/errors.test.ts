/**
 * STUDY-RK-022: dedicated suite for src/errors.ts.
 *
 * errors.ts is an orphan module (no src/ consumer, no prior test import).
 * This file locks the RepoKnowledgeError / RkError contract: name, code +
 * message, retryable default/override, toJSON shape, and instanceof Error.
 */
import { describe, it, expect } from 'vitest';
import { RepoKnowledgeError, type RkError } from '../src/errors.js';

describe('RepoKnowledgeError / RkError', () => {
  it('sets name to RepoKnowledgeError', () => {
    const err = new RepoKnowledgeError('E_TEST', 'boom');
    expect(err.name).toBe('RepoKnowledgeError');
  });

  it('sets code and message', () => {
    const err = new RepoKnowledgeError('E_CODE', 'the message');
    expect(err.code).toBe('E_CODE');
    expect(err.message).toBe('the message');
  });

  it('defaults retryable to false and allows opts override', () => {
    const def = new RepoKnowledgeError('E_DEF', 'default retryable');
    expect(def.retryable).toBe(false);

    const retry = new RepoKnowledgeError('E_NET', 'timeout', { retryable: true });
    expect(retry.retryable).toBe(true);

    const explicitFalse = new RepoKnowledgeError('E_NO', 'no retry', { retryable: false });
    expect(explicitFalse.retryable).toBe(false);
  });

  it('toJSON returns {code,message,hint,cause,retryable}', () => {
    const err = new RepoKnowledgeError('E_JSON', 'serialized', {
      hint: 'try again',
      cause: 'ETIMEDOUT',
      retryable: true,
    });
    const json: RkError = err.toJSON();
    expect(json).toEqual({
      code: 'E_JSON',
      message: 'serialized',
      hint: 'try again',
      cause: 'ETIMEDOUT',
      retryable: true,
    });
    expect(Object.keys(json).sort()).toEqual(
      ['cause', 'code', 'hint', 'message', 'retryable'].sort(),
    );
  });

  it('toJSON includes undefined hint/cause and default retryable when opts omitted', () => {
    const err = new RepoKnowledgeError('E_PLAIN', 'plain');
    expect(err.toJSON()).toEqual({
      code: 'E_PLAIN',
      message: 'plain',
      hint: undefined,
      cause: undefined,
      retryable: false,
    });
  });

  it('is an instanceof Error and RepoKnowledgeError', () => {
    const err = new RepoKnowledgeError('E_ISA', 'typed');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(RepoKnowledgeError);
    expect(err instanceof Error).toBe(true);
  });
});
