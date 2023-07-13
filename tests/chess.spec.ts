import { expect } from '@playwright/test';
import { test } from './chess.playwright';

test('basic', async ({ page, setup, play, thankyou }) => {
  await test.step('check title', async () => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Chessboard/);
  });

  await test.step('check setup testids', async () => {
    await setup.goto();

    expect(await setup.size().inputValue()).toEqual('10');
    expect(await setup.maxSteps().inputValue()).toEqual('10');
    expect(await setup.next().isEnabled()).toBeTruthy();
  });

  await test.step('check play testids', async () => {
    await play.goto();

    expect(await play.blocks()).toHaveLength(100);
    expect(await play.back().isEnabled()).toBeTruthy();
    expect(await play.reset().isEnabled()).toBeTruthy();
    expect(await play.next().isEnabled()).toBeFalsy();
    expect(await play.selectedBlocks()).toHaveLength(1);
  });

  await test.step('check thankyou testids', async () => {
    await thankyou.goto();

    expect(await thankyou.back().isEnabled()).toBeTruthy();
    expect(await thankyou.startOver().isEnabled()).toBeTruthy();
  });
});

test('check board sizes', async ({ setup, play }) => {
  await test.step('goto play and check initial size 10x10', async () => {
    await play.goto();
    expect(await play.blocks()).toHaveLength(10 * 10);
  });

  await test.step('goto setup to set size=5 (5x5 grid)', async () => {
    await play.back().click();
    await setup.size().click();
    await setup.size().fill('5');
    await setup.next().click();

    expect(await play.blocks()).toHaveLength(5 * 5);
  });

  await test.step('goto setup and change to size 20 (20x20 grid)', async () => {
    await play.back().click();
    await setup.size().click();
    await setup.size().fill('20');
    await setup.next().click();

    expect(await play.blocks()).toHaveLength(20 * 20);
  });
});

test('back and forth 5x5 in 1 step', async ({ setup, play, thankyou }) => {
  await test.step('setup 5x5 board with 1 step', async () => {
    await setup.goto();
    await setup.root().hover();
    await setup.size().click();
    await setup.size().fill('5');
    await setup.maxSteps().click();
    await setup.maxSteps().fill('1');
    expect(await setup.size().inputValue()).toEqual('5');
    expect(await setup.maxSteps().inputValue()).toEqual('1');
  });

  await test.step('goto play', async () => {
    await setup.next().click();
    await play.root().hover();
    expect(await play.blocks()).toHaveLength(25);
    expect(await play.selectedBlocks()).toHaveLength(1);
    await play.next().isEnabled();
  });

  await test.step('goto thankyou', async () => {
    await play.next().click();
    await thankyou.root().hover();
    await thankyou.selectedStepOL().isVisible();
    expect(await thankyou.selectedStepLI()).toHaveLength(1);
  });

  await test.step('back to play', async () => {
    await thankyou.back().click();
    await play.root().hover();
  });

  await test.step('back to setup', async () => {
    await play.back().click();
    await setup.root().hover();
  });

  await test.step('goto play and then thankyou', async () => {
    await setup.next().click();
    await play.root().hover();
    await play.next().click();
  });

  await test.step('start over and back to setup', async () => {
    await thankyou.root().hover();
    await thankyou.startOver().click();
    await setup.root().hover();
  });
});

test('select blocks 3x3 in 2 step with key', async ({ setup, play }) => {
  await test.step('setup 3x3 board with 2 step', async () => {
    await setup.goto('?n=3&m=2&x=1&y=1');
    await setup.root().hover();
    expect(await setup.size().inputValue()).toEqual('3');
    expect(await setup.maxSteps().inputValue()).toEqual('2');
  });

  await test.step('check chessboard 3x3, maxSteps 2', async () => {
    await setup.next().click();
    await play.root().hover();
    expect(await play.blocks()).toHaveLength(3 * 3);
    expect(await play.selectedBlocks()).toHaveLength(1);
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 1 });
  });

  await test.step('check input again', async () => {
    await play.back().click();
    await setup.root().hover();
    expect(await setup.size().inputValue()).toEqual('3');
    expect(await setup.maxSteps().inputValue()).toEqual('2');
  });

  await test.step('check chessboard again', async () => {
    await setup.next().click();
    await play.root().hover();
    expect(await play.blocks()).toHaveLength(3 * 3);
    expect(await play.selectedBlocks()).toHaveLength(1);
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 1 });
  });
});

test('select blocks 4x4 in 3 step with key', async ({ setup, play }) => {
  await test.step('check chessboard 4x4, maxSteps', async () => {
    await play.goto('?n=4&m=3&x=1&y=1');
    await play.root().hover();
    expect(await play.blocks()).toHaveLength(4 * 4);
    expect(await play.selectedBlocks()).toHaveLength(1);
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 1 });
  });

  await test.step('check setup 4x4 board with 3 step', async () => {
    await play.back().click();
    await setup.root().hover();
    expect(await setup.size().inputValue()).toEqual('4');
    expect(await setup.maxSteps().inputValue()).toEqual('3');
  });

  await test.step('check chessboard again', async () => {
    await setup.next().click();
    await play.root().hover();
    expect(await play.blocks()).toHaveLength(4 * 4);
    expect(await play.selectedBlocks()).toHaveLength(1);
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 1 });
  });

  await test.step('check input again', async () => {
    await play.back().click();
    await setup.root().hover();
    expect(await setup.size().inputValue()).toEqual('4');
    expect(await setup.maxSteps().inputValue()).toEqual('3');
  });
});

test('check last selected step after each move', async ({ play }) => {
  await test.step('5x6 grid, max 20 steps, start at (1,1)', async () => {
    await play.goto('?n=5x5&m=20&x=1&y=1');
  });

  await test.step('move right 3 times', async () => {
    await play.next().isDisabled();
    await play.root().press('ArrowRight');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 2 });
    await play.root().press('ArrowRight');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 3 });
    await play.root().press('ArrowRight');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 4 });
  });

  await test.step('move down 3 times', async () => {
    await play.root().press('ArrowDown');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 2, y: 4 });
    await play.root().press('ArrowDown');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 3, y: 4 });
    await play.root().press('ArrowDown');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 4, y: 4 });
  });

  await test.step('move left 3 times', async () => {
    await play.root().press('ArrowLeft');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 4, y: 3 });
    await play.root().press('ArrowLeft');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 4, y: 2 });
    await play.root().press('ArrowLeft');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 4, y: 1 });
  });

  await test.step('move up 3 times', async () => {
    await play.root().press('ArrowUp');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 3, y: 1 });
    await play.root().press('ArrowUp');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 2, y: 1 });
  });

  await test.step('move up 3 times, but it wont go up anymore, because it is blocked', async () => {
    await play.root().press('ArrowUp'); // cannot cross
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 2, y: 1 });
    await play.root().press('ArrowUp'); // cannot cross
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 2, y: 1 });
    await play.root().press('ArrowUp'); // cannot cross
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 2, y: 1 });
  });
});

test('move around', async ({ setup, play, thankyou }) => {
  await test.step('5x5 grid, max 5 steps, start at (1,1)', async () => {
    await setup.goto('?n=5&m=5&x=1&y=1');
  });

  await test.step('setup 5x5 board with 5 step', async () => {
    await setup.root().hover();
    await setup.size().click();
    await setup.size().fill('5');
    await setup.maxSteps().click();
    await setup.maxSteps().fill('5');
    expect(await setup.size().inputValue()).toEqual('5');
    expect(await setup.maxSteps().inputValue()).toEqual('5');
  });

  await test.step('play', async () => {
    await setup.next().click();
    await play.next().isDisabled();
    await play.root().press('ArrowRight');
    await play.root().press('ArrowDown');
    await play.root().press('ArrowRight');
    await play.root().press('ArrowDown');
    await play.next().isEnabled();
  });

  await test.step('thankyou and back', async () => {
    await play.next().click();
    await thankyou.root().hover();
    await thankyou.selectedStepOL().isVisible();
    expect(await thankyou.selectedStepLI()).toHaveLength(5);
  });
});

test('move right and then left', async ({ play }) => {
  await test.step('5x5 grid, max 5 steps, start at (1,1)', async () => {
    await play.goto('?n=5&m=5&x=1&y=1');
  });

  await test.step('move right 4 times', async () => {
    await play.next().isDisabled();
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 1 });

    await play.root().press('ArrowRight');
    await play.root().press('ArrowRight');
    await play.root().press('ArrowRight');
    await play.root().press('ArrowRight');

    expect(await play.selectedBlocks()).toHaveLength(5);
    await play.next().isEnabled();
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 5 });
  });

  await test.step('move left 4 times', async () => {
    await play.next().isEnabled();
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 5 });

    await play.root().press('ArrowLeft');
    await play.root().press('ArrowLeft');
    await play.root().press('ArrowLeft');
    await play.root().press('ArrowLeft');
    expect(await play.selectedBlocks()).toHaveLength(1);
    await play.next().isDisabled();
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 1 });
  });
});

test('move down and then up', async ({ play }) => {
  await test.step('5x5 grid, max 5 steps, start at (1,1)', async () => {
    await play.goto('?n=5&m=5&x=1&y=1');
  });

  await test.step('move down 4 times', async () => {
    await play.next().isDisabled();
    await play.root().press('ArrowDown');
    await play.root().press('ArrowDown');
    await play.root().press('ArrowDown');
    await play.root().press('ArrowDown');
    expect(await play.selectedBlocks()).toHaveLength(5);
    await play.next().isEnabled();
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 5, y: 1 });
  });

  await test.step('move up 4 times', async () => {
    await play.root().press('ArrowUp');
    await play.root().press('ArrowUp');
    await play.root().press('ArrowUp');
    await play.root().press('ArrowUp');
    expect(await play.selectedBlocks()).toHaveLength(1);
    await play.next().isDisabled();
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 1 });
  });
});

test('move diagonal downand then diagonal up', async ({ play }) => {
  await test.step('5x5 grid, max 5 steps, start at (1,1)', async () => {
    await play.goto('?n=5&m=5&x=1&y=1');
  });

  await test.step('move right, down, right, down', async () => {
    await play.next().isDisabled();
    await play.root().press('ArrowRight');
    await play.root().press('ArrowDown');
    await play.root().press('ArrowRight');
    await play.root().press('ArrowDown');
    expect(await play.selectedBlocks()).toHaveLength(5);
    await play.next().isEnabled();
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 3, y: 3 });
  });

  await test.step('move up, left, up, left', async () => {
    await play.root().press('ArrowUp');
    await play.root().press('ArrowLeft');
    await play.root().press('ArrowUp');
    await play.root().press('ArrowLeft');
    expect(await play.selectedBlocks()).toHaveLength(1);
    await play.next().isDisabled();
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 1 });
  });
});

test('cannot cross itself in the middle', async ({ play }) => {
  await test.step('6x6 grid, max 20 steps, start at (1,1)', async () => {
    await play.goto('?n=6&m=20&x=1&y=1');
  });

  await test.step('move right 3 times', async () => {
    await play.next().isDisabled();
    await play.root().press('ArrowRight');
    await play.root().press('ArrowRight');
    await play.root().press('ArrowRight');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 1, y: 4 });
    expect(await play.selectedBlocks()).toHaveLength(4);
  });

  await test.step('move down 3 times', async () => {
    await play.root().press('ArrowDown');
    await play.root().press('ArrowDown');
    await play.root().press('ArrowDown');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 4, y: 4 });
    expect(await play.selectedBlocks()).toHaveLength(7);
  });

  await test.step('move left 3 times', async () => {
    await play.root().press('ArrowLeft');
    await play.root().press('ArrowLeft');
    await play.root().press('ArrowLeft');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 4, y: 1 });
    expect(await play.selectedBlocks()).toHaveLength(10);
  });

  await test.step('move up 3 times', async () => {
    await play.root().press('ArrowUp');
    await play.root().press('ArrowUp');
    await play.root().press('ArrowUp');
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 2, y: 1 });
    expect(await play.selectedBlocks()).toHaveLength(12);
  });

  await test.step('move up 3 times, but it wont go up anymore, because it is blocked', async () => {
    await play.root().press('ArrowUp'); // cannot cross
    await play.root().press('ArrowUp'); // cannot cross
    await play.root().press('ArrowUp'); // cannot cross
    expect(await play.lastSelectedBlockPosition()).toEqual({ x: 2, y: 1 });
    expect(await play.selectedBlocks()).toHaveLength(12);
  });
});
