import { Locator, Page } from '@playwright/test';
import { SETUP_TESTID, PLAY_TESTID, BLOCK_TESTID, SELECTED_BLOCK_TESTID, THANKYOU_TESTID, SELECTED_STEPS_TESTID, Position } from '../src/App';

export const getDataTestidPosition = async (selectedBlock: Locator): Promise<Position> => {
    const attr = await selectedBlock.getAttribute('data-testid');
    const matched = attr?.match(/.*_\D+(\d+)-(\d+)/);
    if (matched == null) {
        throw new Error(`element must have data-testid with /.*_\\D+(\\d+)-(\\d+)/ regexp pattern`)
    }

    const [_, x, y] = matched;
    const position: Position = {
        x: parseInt(x, 10),
        y: parseInt(y, 10)
    };
    return position;
};


export const getPlay = (page: Page)  => {
  const root = page.getByTestId(PLAY_TESTID.root);
  const back = page.getByTestId(PLAY_TESTID.back);
  const next = page.getByTestId(PLAY_TESTID.next);
  const remainingStep = page.getByTestId(PLAY_TESTID.remainingStep);
  const board = page.getByTestId(PLAY_TESTID.board);
  const blocks = page.getByTestId(BLOCK_TESTID.blocks); // .all();
  const selectedBlocks = page.getByTestId(SELECTED_BLOCK_TESTID.selectedBlocks); // .all();

  const lastSelectedBlock = selectedBlocks.last();
  
  return {
    root,
    back,
    next,
    remainingStep,
    board,
    blocks,
    selectedBlocks,
    lastSelectedBlock,
  };
}

export const getSetup = (page: Page) => {
  const root = page.getByTestId(SETUP_TESTID.root);
  const size = page.getByTestId(SETUP_TESTID.size);
  const maxSteps = page.getByTestId(SETUP_TESTID.maxSteps);
  const next = page.getByTestId(SETUP_TESTID.next);

  return {
    root,
    size,
    maxSteps,
    next,
  };
};

export const getThankyou = (page: Page) => {
  const root = page.getByTestId(THANKYOU_TESTID.root);
  const selectedStepOL = page.getByTestId(THANKYOU_TESTID.selectedStepOL);
  const back = page.getByTestId(THANKYOU_TESTID.back);
  const startOver = page.getByTestId(THANKYOU_TESTID.startOver);
  const selectedStepLI = page.getByTestId(SELECTED_STEPS_TESTID.selectedStepLIRegexp); // .all()


  return {
    root,
    selectedStepOL,
    selectedStepLI,
    back,
    startOver,
  };
};