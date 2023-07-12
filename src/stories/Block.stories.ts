import type { Meta, StoryObj } from '@storybook/react';

import { Block , USE_CHESS_DEFAULT } from '../App';

const meta = {
  title: 'Example/Block',
  component: Block,
  tags: ['autodocs'],
} satisfies Meta<typeof Block>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GreyBlock: Story = {
  args: {
    chess: { ...USE_CHESS_DEFAULT, size: 10, sizeBlock: 100},
    position: {x:1, y:1},
  },
};

export const PinkBlock: Story = {
  args: {
    chess: { ...USE_CHESS_DEFAULT, size: 10, sizeBlock: 100},
    position: {x:1, y: 2},
    style: { backgroundColor: 'pink'},
  },
};

export const TealBlock: Story = {
  args: {
    chess: { ...USE_CHESS_DEFAULT, size: 10, sizeBlock: 100},
    position: {x:1, y: 2},
    style: { backgroundColor: 'teal'},
  },
};

export const LightGreyBlock: Story = {
  args: {
    chess: { ...USE_CHESS_DEFAULT, size: 10, sizeBlock: 100},
    position: {x:1, y:1},
    style: { backgroundColor: 'lightgrey'},
  },
};

export const WhiteBlock: Story = {
  args: {
    chess: { ...USE_CHESS_DEFAULT, size: 10, sizeBlock: 100},
    position: {x:1, y: 2},
  },
};
