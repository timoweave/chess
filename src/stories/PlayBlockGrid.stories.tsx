/* eslint-disable react-refresh/only-export-components */
import type { Meta, StoryObj } from '@storybook/react';

import {
  Blocks,
  SelectedBlocks,
  PlayBlockGrid,
  USE_CHESS_DEFAULT,
  getNxN,
  getNxNGridArea,
  ChessReturn,
  Position,
} from '../App';

const meta = {
  title: 'Example/PlayBlockGrid',
  component: PlayBlockGrid,
  tags: ['autodocs'],
} satisfies Meta<typeof PlayBlockGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeDiagonalPosition = (n: number, down = true): Position[] =>
  Array.from(Array(n), (_, i) => i + 1).map((i) => ({
    x: down ? i : n + 1 - i,
    y: i,
  }));

const makeStoryOfBlockNxN = (props: {
  size: number;
  sizeBlock: number;
  maxSteps: number;
  selectedSteps: Position[];
  children?: ((props: { chess: ChessReturn }) => JSX.Element)[];
}): Story => {
  const { size, sizeBlock, maxSteps, selectedSteps, children = [] } = props;
  const chess: ChessReturn = {
    ...USE_CHESS_DEFAULT,
    size: size,
    maxSteps: maxSteps,
    sizeBlock: sizeBlock,
    sizeChess: sizeBlock * size,
    selectedSteps,
    nxn: getNxN(size),
    nxnGridArea: getNxNGridArea(size),
  };

  return {
    args: {
      chess,
      children: children.map((Child) => <Child chess={chess} />),
    },
  };
};

export const PlayBlockGrid5x5: Story = makeStoryOfBlockNxN({
  size: 5,
  sizeBlock: 100,
  maxSteps: 10,
  selectedSteps: [],
  children: [Blocks],
});

export const PlayBlockGrid5x5a: Story = makeStoryOfBlockNxN({
  size: 5,
  sizeBlock: 100,
  maxSteps: 10,
  selectedSteps: makeDiagonalPosition(5),
  children: [Blocks, SelectedBlocks],
});

export const PlayBlockGrid5x5b: Story = makeStoryOfBlockNxN({
  size: 5,
  sizeBlock: 100,
  maxSteps: 10,
  selectedSteps: [1, 2, 3, 4, 5].map((i) => ({ x: 2, y: i })),
  children: [Blocks, SelectedBlocks],
});

export const PlayBlockGrid5x5c: Story = makeStoryOfBlockNxN({
  size: 5,
  sizeBlock: 100,
  maxSteps: 10,
  selectedSteps: [1, 2, 3, 4, 5].map((i) => ({ x: i, y: 3 })),
  children: [Blocks, SelectedBlocks],
});

export const PlayBlockGrid5x5d: Story = makeStoryOfBlockNxN({
  size: 5,
  sizeBlock: 100,
  maxSteps: 10,
  selectedSteps: makeDiagonalPosition(5, false),
  children: [Blocks, SelectedBlocks],
});

export const PlayBlockGrid10x10: Story = makeStoryOfBlockNxN({
  size: 10,
  sizeBlock: 50,
  maxSteps: 10,
  selectedSteps: [],
  children: [Blocks],
});

export const PlayBlockGrid10x10b: Story = makeStoryOfBlockNxN({
  size: 10,
  sizeBlock: 50,
  maxSteps: 10,
  selectedSteps: makeDiagonalPosition(10),
  children: [Blocks, SelectedBlocks],
});

export const PlayBlockGrid20x20: Story = makeStoryOfBlockNxN({
  size: 20,
  sizeBlock: 25,
  maxSteps: 20,
  selectedSteps: [{ x: 10, y: 10 }],
  children: [Blocks, SelectedBlocks],
});

export const PlayBlockGrid20x20a: Story = makeStoryOfBlockNxN({
  size: 20,
  sizeBlock: 25,
  maxSteps: 20,
  selectedSteps: makeDiagonalPosition(20),
  children: [Blocks, SelectedBlocks],
});

export const PlayBlockGrid25x25: Story = makeStoryOfBlockNxN({
  size: 25,
  sizeBlock: 20,
  maxSteps: 20,
  selectedSteps: [],
  children: [Blocks],
});

export const PlayBlockGrid25x25A: Story = makeStoryOfBlockNxN({
  size: 25,
  sizeBlock: 20,
  maxSteps: 25,
  selectedSteps: makeDiagonalPosition(25, false),
  children: [Blocks, SelectedBlocks],
});

export const PlayBlockGrid50x50: Story = makeStoryOfBlockNxN({
  size: 50,
  sizeBlock: 10,
  maxSteps: 20,
  selectedSteps: [],
  children: [Blocks],
});
