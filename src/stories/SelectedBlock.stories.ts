import type { Meta, StoryObj } from '@storybook/react';

import { SelectedBlock , USE_CHESS_DEFAULT } from '../App';

const meta = {
  title: 'Example/SelectedBlock',
  component: SelectedBlock,
  tags: ['autodocs'],
} satisfies Meta<typeof SelectedBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectedBlock_0: Story = {
  args: {
    chess: { ...USE_CHESS_DEFAULT, size: 4, sizeBlock: 100},
    position: {x:1, y:1},
  },
};

export const SelectedBlock_1: Story = {
  args: {
    chess: { ...USE_CHESS_DEFAULT, size: 4, sizeBlock: 100, selectedSteps: [{x:1, y: 1}]},
    position: {x:1, y:1},
  },
};


export const SelectedBlock_2: Story = {
  args: {
    chess: { ...USE_CHESS_DEFAULT, size: 4, sizeBlock: 100, selectedSteps: [
        {x:1, y: 1}, {x: 1, y:2 }, 
    ]},
    position: {x:1, y: 2},
  },
};

export const SelectedBlock_4: Story = {
  args: {
    chess: { ...USE_CHESS_DEFAULT, size: 5, sizeBlock: 100, selectedSteps: [
        {x:3, y: 3}, {x: 3, y:4 }, {x: 3, y: 5 }, {x: 2, y: 5 }, 
    ]},
    position: {x:2, y: 5},
  },
};