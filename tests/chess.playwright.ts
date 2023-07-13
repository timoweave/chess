import { Response, Locator, Page, test as base } from '@playwright/test';
import {
  SETUP_TESTID,
  PLAY_TESTID,
  BLOCK_TESTID,
  SELECTED_BLOCK_TESTID,
  THANKYOU_TESTID,
  SELECTED_STEPS_TESTID,
  Position,
} from '../src/App';

export const getDataTestidPosition = async (
  selectedBlock: Locator,
): Promise<Position> => {
  const attr = await selectedBlock.getAttribute('data-testid');
  const matched = attr?.match(/.*_\D+(\d+)-(\d+)/);
  if (matched == null) {
    throw new Error(
      `element must have data-testid with /.*_\\D+(\\d+)-(\\d+)/ regexp pattern`,
    );
  }

  const [_, x, y] = matched;
  const position: Position = {
    x: parseInt(x, 10),
    y: parseInt(y, 10),
  };
  return position;
};

export const getPlay = (page: Page) => {
  const root = (): Locator => page.getByTestId(PLAY_TESTID.root);
  const back = (): Locator => page.getByTestId(PLAY_TESTID.back);
  const reset = (): Locator => page.getByTestId(PLAY_TESTID.reset);
  const next = (): Locator => page.getByTestId(PLAY_TESTID.next);
  const remainingStep = (): Locator =>
    page.getByTestId(PLAY_TESTID.remainingStep);
  const board = (): Locator => page.getByTestId(PLAY_TESTID.board);
  const blocks = (): Promise<Locator[]> =>
    page.getByTestId(BLOCK_TESTID.blocks).all();
  const selectedBlocks = (): Promise<Locator[]> =>
    page.getByTestId(SELECTED_BLOCK_TESTID.selectedBlocks).all();

  const lastSelectedBlock = async (): Promise<Locator | undefined> => {
    const all = await selectedBlocks();
    return all.at(-1);
  };

  const lastSelectedBlockPosition = async (): Promise<Position> => {
    const block = await lastSelectedBlock();
    if (block == null) {
      throw new Error('must have a non-null last selected block');
    }
    return await getDataTestidPosition(block);
  };

  const goto = async (query?: string): Promise<Response | null> =>
    await page.goto(`/play${query ?? ''}`);

  return {
    root,
    back,
    reset,
    next,
    remainingStep,
    board,
    blocks,
    selectedBlocks,
    lastSelectedBlock,
    lastSelectedBlockPosition,
    goto,
  };
};

export const getSetup = (page: Page) => {
  const root = (): Locator => page.getByTestId(SETUP_TESTID.root);
  const size = (): Locator => page.getByTestId(SETUP_TESTID.size);
  const maxSteps = (): Locator => page.getByTestId(SETUP_TESTID.maxSteps);
  const next = (): Locator => page.getByTestId(SETUP_TESTID.next);

  const goto = async (query?: string): Promise<Response | null> =>
    await page.goto(`/setup${query ?? ''}`);

  return {
    goto,
    root,
    size,
    maxSteps,
    next,
  };
};

export const getThankyou = (page: Page) => {
  const root = (): Locator => page.getByTestId(THANKYOU_TESTID.root);
  const selectedStepOL = (): Locator =>
    page.getByTestId(THANKYOU_TESTID.selectedStepOL);
  const back = (): Locator => page.getByTestId(THANKYOU_TESTID.back);
  const startOver = (): Locator => page.getByTestId(THANKYOU_TESTID.startOver);
  const selectedStepLI = async (): Promise<Locator[]> => {
    const li = page.getByTestId(SELECTED_STEPS_TESTID.selectedStepLIRegexp);
    return await li.all();
  };

  const goto = async (query?: string): Promise<Response | null> =>
    await page.goto(`/thankyou${query ?? ''}`);

  return {
    goto,
    root,
    selectedStepOL,
    selectedStepLI,
    back,
    startOver,
  };
};

export const test = base.extend<{
  setup: ReturnType<typeof getSetup>;
  play: ReturnType<typeof getPlay>;
  thankyou: ReturnType<typeof getThankyou>;
}>({
  setup: async ({ page }, use) => await use(getSetup(page)),
  play: async ({ page }, use) => await use(getPlay(page)),
  thankyou: async ({ page }, use) => await use(getThankyou(page)),
});
