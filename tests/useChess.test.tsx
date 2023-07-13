import {
  useChess,
  AppProvider,
  pressArrowRight,
  pressArrowLeft,
  pressArrowUp,
  pressArrowDown,
  ChessReturn,
} from '../src/App';
import { act, renderHook } from '@testing-library/react';
import { test, expect, describe } from 'vitest';
import React from 'react';

describe('useChess', () => {
  test('init with n=10, m=10 (default values)', async () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useChess(), { wrapper });
    const chess = (): ChessReturn => result.current;

    expect(chess().size).toEqual(10);
    expect(chess().maxSteps).toEqual(10);
    expect(chess().remainingStep).toEqual(9);
    expect(chess().selectedSteps).toHaveLength(1);
    expect(chess().nxn).toHaveLength(10 * 10);
  });

  test('init with n=5, m=20', async () => {
    const wrapper = ({ children }) => (
      <AppProvider initSize={5} initMaxSteps={20} initPosition={undefined}>
        {children}
      </AppProvider>
    );
    const { result } = renderHook(() => useChess(), { wrapper });
    const chess = (): ChessReturn => result.current;

    expect(chess().size).toEqual(5);
    expect(chess().maxSteps).toEqual(20);
    expect(chess().remainingStep).toEqual(19);
    expect(chess().selectedSteps).toHaveLength(1);
    expect(chess().nxn).toHaveLength(5 * 5);
  });

  test('init with n=5, m=20, x=1, y=1', async () => {
    const wrapper = ({ children }) => (
      <AppProvider initSize={5} initMaxSteps={20} initPosition={{ x: 1, y: 1 }}>
        {children}
      </AppProvider>
    );
    const { result } = renderHook(() => useChess(), { wrapper });
    const chess = (): ChessReturn => result.current;

    expect(chess().size).toEqual(5);
    expect(chess().maxSteps).toEqual(20);
    expect(chess().remainingStep).toEqual(19);
    expect(chess().selectedSteps).toHaveLength(1);
    expect(chess().lastSelectedStep).toEqual({ x: 1, y: 1 });
    expect(chess().nxn).toHaveLength(5 * 5);
  });

  test('change selected steps', async () => {
    const wrapper = ({ children }) => (
      <AppProvider initSize={5} initMaxSteps={20} initPosition={{ x: 3, y: 3 }}>
        {children}
      </AppProvider>
    );
    const { result } = renderHook(() => useChess(), { wrapper });

    const chess = (): ChessReturn => result.current;

    expect(chess().lastSelectedStep).toEqual({ x: 3, y: 3 });
    expect(chess().selectedSteps).toHaveLength(1);

    act(() => chess().setSelectedSteps([{ x: 3, y: 4 }]));
    expect(chess().lastSelectedStep).toEqual({ x: 3, y: 4 });
    expect(chess().selectedSteps).toHaveLength(1);

    act(() =>
      chess().setSelectedSteps([
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ]),
    );
    expect(chess().lastSelectedStep).toEqual({ x: 2, y: 2 });
    expect(chess().selectedSteps).toHaveLength(2);

    act(() => chess().setSelectedSteps((p) => [...p, { x: 3, y: 3 }]));
    expect(chess().lastSelectedStep).toEqual({ x: 3, y: 3 });
    expect(chess().selectedSteps).toHaveLength(3);
  });

  test('move right twice', async () => {
    const wrapper = ({ children }) => (
      <AppProvider initSize={5} initMaxSteps={20} initPosition={{ x: 3, y: 3 }}>
        {children}
      </AppProvider>
    );
    const { result } = renderHook(() => useChess(), { wrapper });
    const chess = (): ChessReturn => result.current;

    expect(chess().selectedSteps).toHaveLength(1);
    expect(chess().lastSelectedStep).toEqual({ x: 3, y: 3 });

    act(() => pressArrowRight(chess()));
    expect(chess().selectedSteps).toHaveLength(2);
    expect(chess().lastSelectedStep).toEqual({ x: 3, y: 4 });

    act(() => pressArrowLeft(chess()));
    expect(chess().selectedSteps).toHaveLength(1);
    expect(chess().lastSelectedStep).toEqual({ x: 3, y: 3 });

    act(() => pressArrowUp(chess()));
    expect(chess().selectedSteps).toHaveLength(2);
    expect(chess().lastSelectedStep).toEqual({ x: 2, y: 3 });

    act(() => pressArrowDown(chess()));
    expect(chess().selectedSteps).toHaveLength(1);
    expect(chess().lastSelectedStep).toEqual({ x: 3, y: 3 });
  });
});
