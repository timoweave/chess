import { test, expect } from '@playwright/test';
import {
  getDataTestidPosition,
  getPlay,
  getSetup,
  getThankyou,
} from './chess.playwright';

test('basic', async ({ page }) => {
  await test.step('title', async () => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Chessboard/);
  });

  await test.step('/setup testids', async () => {
    await page.goto('/setup');

    const { size, maxSteps } = getSetup(page);
    expect(await size.inputValue()).toEqual('10');
    expect(await maxSteps.inputValue()).toEqual('10');
  });

  await test.step('/play testids', async () => {
    await page.goto('/play');
    const { blocks, selectedBlocks } = getPlay(page);

    expect(await blocks.all()).toHaveLength(100);
    expect(await selectedBlocks.all()).toHaveLength(1);
  });

  await test.step('/thankyou testids', async () => {
    await page.goto('/thankyou');
    const { back, startOver } = getThankyou(page);

    expect(await back.isEnabled()).toBeTruthy();
    expect(await startOver.isEnabled()).toBeTruthy();
  });
});

test('check board sizes', async ({ page }) => {
  await page.goto('/play');

  const { blocks, back: back2Setup } = getPlay(page);
  await test.step('initial size 10x10', async () => {
    expect(await blocks.all()).toHaveLength(10 * 10);
  });

  await back2Setup.click();
  const { size, next: jump2Play } = getSetup(page);
  await test.step('change to size 5x5', async () => {
    await size.click();
    await size.fill('5');
    await jump2Play.click();

    expect(await blocks.all()).toHaveLength(5 * 5);
  });

  await back2Setup.click();
  await test.step('change to size 5x5', async () => {
    await size.click();
    await size.fill('20');
    await jump2Play.click();

    expect(await blocks.all()).toHaveLength(20 * 20);
  });
});

test('back and forth 5x5 in 1 step', async ({ page }) => {
  await page.goto('/setup');

  const { root: setup, size, maxSteps, next: jump2Play } = getSetup(page);
  await test.step('setup 5x5 board with 1 step', async () => {
    await setup.hover();
    await size.click();
    await size.fill('5');
    await maxSteps.click();
    await maxSteps.fill('1');
    expect(await size.inputValue()).toEqual('5');
    expect(await maxSteps.inputValue()).toEqual('1');
  });

  await jump2Play.click();
  const {
    root: play,
    back: back2Setup,
    next: jump2Thankyou,
    selectedBlocks,
    blocks,
  } = getPlay(page);
  await test.step('play', async () => {
    await play.hover();
    expect(await blocks.all()).toHaveLength(25);
    expect(await selectedBlocks.all()).toHaveLength(1);
    await jump2Thankyou.isEnabled();
  });

  await jump2Thankyou.click();
  const {
    root: thankyou,
    back: back2Play,
    startOver,
    selectedStepOL,
    selectedStepLI,
  } = getThankyou(page);
  await test.step('thankyou and back', async () => {
    await thankyou.hover();
    await selectedStepOL.isVisible();
    expect(await selectedStepLI.all()).toHaveLength(1);
  });

  await back2Play.click();
  await test.step('back to play', async () => {
    await play.hover();
  });

  await back2Setup.click();
  await test.step('back to setup', async () => {
    await setup.hover();
  });

  await jump2Play.click();
  await test.step('to thankyou', async () => {
    await play.hover();
  });

  await jump2Thankyou.click();
  await test.step('start over', async () => {
    await thankyou.hover();
  });

  await startOver.click();
  await test.step('jump to setup again', async () => {
    await setup.hover();
  });
});

test('select blocks 3x3 in 2 step with key', async ({ page }) => {
  await page.goto('/setup?n=3&m=2&x=1&y=1');

  const { root: setup, size, maxSteps, next: jump2Play } = getSetup(page);
  await test.step('setup 3x3 board with 2 step', async () => {
    await setup.hover();
    expect(await size.inputValue()).toEqual('3');
    expect(await maxSteps.inputValue()).toEqual('2');
  });

  await jump2Play.click();
  const {
    root: play,
    back: back2Setup,
    selectedBlocks,
    lastSelectedBlock,
    blocks,
  } = getPlay(page);
  await test.step('check chessboard 3x3, maxSteps 2', async () => {
    await play.hover();
    expect(await blocks.all()).toHaveLength(3 * 3);
    expect(await selectedBlocks.all()).toHaveLength(1);
    const position = await getDataTestidPosition(lastSelectedBlock);
    expect(position).toEqual({ x: 1, y: 1 });
  });

  await back2Setup.click();
  await test.step('check input again', async () => {
    await setup.hover();
    expect(await size.inputValue()).toEqual('3');
    expect(await maxSteps.inputValue()).toEqual('2');
  });

  await jump2Play.click();
  await test.step('check chessboard again', async () => {
    await play.hover();
    expect(await blocks.all()).toHaveLength(3 * 3);
    expect(await selectedBlocks.all()).toHaveLength(1);
    const position = await getDataTestidPosition(lastSelectedBlock);
    expect(position).toEqual({ x: 1, y: 1 });
  });
});

test('select blocks 4x4 in 3 step with key', async ({ page }) => {
  await page.goto('/play?n=4&m=3&x=1&y=1');

  const {
    root: play,
    back: back2Setup,
    selectedBlocks,
    lastSelectedBlock,
    blocks,
  } = getPlay(page);
  await test.step('check chessboard 4x4, maxSteps', async () => {
    await play.hover();
    expect(await blocks.all()).toHaveLength(4 * 4);
    expect(await selectedBlocks.all()).toHaveLength(1);
    const position = await getDataTestidPosition(lastSelectedBlock);
    expect(position).toEqual({ x: 1, y: 1 });
  });

  await back2Setup.click();
  const { root: setup, size, maxSteps, next: jump2Play } = getSetup(page);
  await test.step('check setup 4x4 board with 3 step', async () => {
    await setup.hover();
    expect(await size.inputValue()).toEqual('4');
    expect(await maxSteps.inputValue()).toEqual('3');
  });

  await jump2Play.click();
  await test.step('check chessboard again', async () => {
    await play.hover();
    expect(await blocks.all()).toHaveLength(4 * 4);
    expect(await selectedBlocks.all()).toHaveLength(1);
    const position = await getDataTestidPosition(lastSelectedBlock);
    expect(position).toEqual({ x: 1, y: 1 });
  });

  await back2Setup.click();
  await test.step('check input again', async () => {
    await setup.hover();
    expect(await size.inputValue()).toEqual('4');
    expect(await maxSteps.inputValue()).toEqual('3');
  });
});

test('select blocks 5x5 in 5 step with key', async ({ page }) => {
  await page.goto('/setup?n=5&m=5&x=1&y=1');

  const { root: setup, size, maxSteps, next: jump2Play } = getSetup(page);
  await test.step('setup 5x5 board with 5 step', async () => {
    await setup.hover();
    await size.click();
    await size.fill('5');
    await maxSteps.click();
    await maxSteps.fill('5');
    expect(await size.inputValue()).toEqual('5');
    expect(await maxSteps.inputValue()).toEqual('5');
  });

  await jump2Play.click();
  const {
    root: play,    
    next: jump2Thankyou,
  } = getPlay(page);
  await test.step('play', async () => {
    await jump2Thankyou.isDisabled();
    await play.press('ArrowRight');
    await play.press('ArrowDown');
    await play.press('ArrowRight');
    await play.press('ArrowDown');
    await jump2Thankyou.isEnabled();
  });

  await jump2Thankyou.click();
  const {
    root: thankyou,
    selectedStepOL,
    selectedStepLI,
  } = getThankyou(page);
  await test.step('thankyou and back', async () => {
    await thankyou.hover();
    await selectedStepOL.isVisible();
    expect(await selectedStepLI.all()).toHaveLength(5);
  });
});

test('move right and then left', async ({ page }) => {
  await page.goto('/play?n=5&m=5&x=1&y=1');

  const {
    root: play,
    next: jump2Thankyou,
    selectedBlocks,
    lastSelectedBlock,
  } = getPlay(page);

  await jump2Thankyou.isDisabled();
  await play.press('ArrowRight');
  await play.press('ArrowRight');
  await play.press('ArrowRight');
  await play.press('ArrowRight');
  expect(await selectedBlocks.all()).toHaveLength(5);
  await jump2Thankyou.isEnabled();
  const position_1_5 = await getDataTestidPosition(lastSelectedBlock);
  expect(position_1_5).toEqual({ x: 1, y: 5 });

  await jump2Thankyou.isEnabled();
  await play.press('ArrowLeft');
  await play.press('ArrowLeft');
  await play.press('ArrowLeft');
  await play.press('ArrowLeft');
  expect(await selectedBlocks.all()).toHaveLength(1);
  await jump2Thankyou.isDisabled();
  const position_1_1 = await getDataTestidPosition(lastSelectedBlock);
  expect(position_1_1).toEqual({ x: 1, y: 1 });
});

test('move down and then up', async ({ page }) => {
  await page.goto('/play?n=5&m=5&x=1&y=1');

  const {
    root: play,
    next: jump2Thankyou,
    selectedBlocks,
    lastSelectedBlock,
  } = getPlay(page);

  await jump2Thankyou.isDisabled();
  await play.press('ArrowDown');
  await play.press('ArrowDown');
  await play.press('ArrowDown');
  await play.press('ArrowDown');
  expect(await selectedBlocks.all()).toHaveLength(5);
  await jump2Thankyou.isEnabled();
  const position_5_1 = await getDataTestidPosition(lastSelectedBlock);
  expect(position_5_1).toEqual({ x: 5, y: 1 });

  await play.press('ArrowUp');
  await play.press('ArrowUp');
  await play.press('ArrowUp');
  await play.press('ArrowUp');
  expect(await selectedBlocks.all()).toHaveLength(1);
  await jump2Thankyou.isDisabled();
  const position_1_1 = await getDataTestidPosition(lastSelectedBlock);
  expect(position_1_1).toEqual({ x: 1, y: 1 });
});

test('move diagonal downand then diagonal up', async ({ page }) => {
  await page.goto('/play?n=5&m=5&x=1&y=1');

  const {
    root: play,
    next: jump2Thankyou,
    selectedBlocks,
    lastSelectedBlock,
  } = getPlay(page);

  await jump2Thankyou.isDisabled();
  await play.press('ArrowRight');
  await play.press('ArrowDown');
  await play.press('ArrowRight');
  await play.press('ArrowDown');
  expect(await selectedBlocks.all()).toHaveLength(5);
  await jump2Thankyou.isEnabled();
  const position_3_3 = await getDataTestidPosition(lastSelectedBlock);
  expect(position_3_3).toEqual({ x: 3, y: 3 });

  await play.press('ArrowUp');
  await play.press('ArrowLeft');
  await play.press('ArrowUp');
  await play.press('ArrowLeft');
  expect(await selectedBlocks.all()).toHaveLength(1);
  await jump2Thankyou.isDisabled();
  const position_1_1 = await getDataTestidPosition(lastSelectedBlock);
  expect(position_1_1).toEqual({ x: 1, y: 1 });
});

test('cannot cross itself in the middle', async ({ page }) => {
  await page.goto('/play?n=6&m=20&x=1&y=1');

  const {
    root: play,
    next: jump2Thankyou,
    selectedBlocks,
  } = getPlay(page);
  
  await jump2Thankyou.isDisabled();
  await play.press('ArrowRight');
  await play.press('ArrowRight');
  await play.press('ArrowRight');
  expect(await selectedBlocks.all()).toHaveLength(4);

  await play.press('ArrowDown');
  await play.press('ArrowDown');
  await play.press('ArrowDown');
  expect(await selectedBlocks.all()).toHaveLength(7);

  await play.press('ArrowLeft');
  await play.press('ArrowLeft');
  await play.press('ArrowLeft');
  expect(await selectedBlocks.all()).toHaveLength(10);

  await play.press('ArrowUp');
  await play.press('ArrowUp');
  await play.press('ArrowUp');
  expect(await selectedBlocks.all()).toHaveLength(12);

  await play.press('ArrowUp'); // cannot cross
  await play.press('ArrowUp'); // cannot cross
  await play.press('ArrowUp'); // cannot cross
  expect(await selectedBlocks.all()).toHaveLength(12);
});