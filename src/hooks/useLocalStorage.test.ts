import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import useLocalStorage from './useLocalStorage';

describe('useLocalStorage:', () => {
  const key = 'testKey';

  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with the value from localStorage if it exists', () => {
    localStorage.setItem(key, JSON.stringify('storedValue'));
    const { result } = renderHook(() => useLocalStorage(key, 'defaultValue'));

    expect(result.current[0]).toBe('storedValue');
  });

  it('should initialize with the default value if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage<string | null>(key, null));

    expect(result.current[0]).toBe(null);
  });

  it('should update the value in state and localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage<string>(key, 'defaultValue'));
    const setValue = result.current[1];

    assert(typeof setValue === 'function');

    act(() => {
      setValue('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorage.getItem(key)).toBe(JSON.stringify('newValue'));
  });

  it('should handle JSON parsing errors gracefully', () => {
    localStorage.setItem(key, 'invalidJSON');
    const { result } = renderHook(() => useLocalStorage(key, 'defaultValue'));

    expect(result.current[0]).toBe('defaultValue');
  });

  it('should handle errors when setting localStorage', () => {
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useLocalStorage<string>(key, 'defaultValue'));
    const setValue = result.current[1];

    assert(typeof setValue === 'function');

    act(() => {
      setValue('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    mockSetItem.mockRestore();
  });
});
