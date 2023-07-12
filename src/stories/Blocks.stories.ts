/* eslint-disable react-refresh/only-export-components */
import type { Meta, StoryObj } from '@storybook/react';

import {
  Blocks,
  USE_CHESS_DEFAULT,
  getNxN,
  getNxNGridArea,
  ChessReturn,
} from '../App';

const meta = {
  title: 'Example/Blocks',
  component: Blocks,
  tags: ['autodocs'],
} satisfies Meta<typeof Blocks>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeStoryOfBlocks = (props: {
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
  };

  return {
    args: {
      chess,
    },
  };
};

export const Blocks5: Story = makeStoryOfBlocks({
  size: 5,
  sizeBlock: 100,
});

export const Blocks10x10: Story = makeStoryOfBlocks({
  size: 10,
  sizeBlock: 50,
});

export const Blocks20x20: Story = makeStoryOfBlocks({
  size: 20,
  sizeBlock: 25,
});

export const Blocks25x25: Story = makeStoryOfBlocks({
  size: 25,
  sizeBlock: 20,
});

export const Blocks50x50: Story = makeStoryOfBlocks({
  size: 50,
  sizeBlock: 10,
});
