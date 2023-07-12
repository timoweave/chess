/* eslint-disable react-refresh/only-export-components */
import type { Meta, StoryObj } from '@storybook/react';

import {
  SelectedBlocks,
  USE_CHESS_DEFAULT,
  getNxN,
  Position,
  getNxNGridArea,
  ChessReturn,
} from '../App';

const meta = {
  title: 'Example/SelectedBlocks',
  component: SelectedBlocks,
  tags: ['autodocs'],
} satisfies Meta<typeof SelectedBlocks>;

export default meta;
type Story = StoryObj<typeof meta>;

const makePositions = (n: number): Position[] =>
  Array.from(Array(n), (_, i) => i + 1).map((i) => ({
    x: i,
    y: i,
  }));


const makeStoryOfSelectedBlocks = (props: {
  size: number;
  sizeBlock: number;
}): Story => {
  const { size, sizeBlock } = props;
  const chess: ChessReturn = {
    ...USE_CHESS_DEFAULT,
    size: size,
    sizeBlock: sizeBlock,
    sizeChess: sizeBlock * size,
    nxn: getNxN(size),
    nxnGridArea: getNxNGridArea(size),
    selectedSteps: makePositions(size),
  };

  return {
    args: {
      chess,
    },
  };
};

export const SelectedBlocks5: Story = makeStoryOfSelectedBlocks({
  size: 5,
  sizeBlock: 100,
});

export const SelectedBlocks10x10: Story = makeStoryOfSelectedBlocks({
  size: 10,
  sizeBlock: 50,
});

export const SelectedBlocks20x20: Story = makeStoryOfSelectedBlocks({
  size: 20,
  sizeBlock: 50,
});

export const SelectedBlocks25x25: Story = makeStoryOfSelectedBlocks({
  size: 25,
  sizeBlock: 50,
});

export const SelectedBlocks50x50: Story = makeStoryOfSelectedBlocks({
  size: 50,
  sizeBlock: 50,
});
