# Chess Board
1. able to define the size of the chess board
1. set the user max number of steps
1. able go to previou next step
1. able go next step when the condition is met
1. able to back track a step (undo selected step)
1. only allow adjacent step to be selected

# React Hooks
1. states
   1. `size`: size of the chess board NxN
   1. `maxSteps`: allowable number of selected blocks (or position)
   1. `steps`: a list of selected blocks (or positions)
   1. `lastStep`: last selected block (or positions)
   1. `stage`: three stages (1. start, 2. play, 3. done)
1. generated states
   1. `nxn`: generate array of positions for blocks
   1. `nxnGrid`: generate css-template-area for blocks
   1. `isDone`: reach stage 3
   1. `sizeChess`: overall dimension (width, height) of the whole chess block
   1. `sizeBlock`: dimension (width, height) of each block.
   1. `remaingingStep`: available number of unselect step
   1. `lastSelectedStep`: last recently selected block
   1. `lastSelectedStepAdjacentSteps`: adjacent blocks around the last recently selected block
1. helper functions
   1. `setFristBlockRandomly`: pick a random block (or position)
   1. `isBlockSelected`: if the block is already selected
   1. `getBlockSelectedIndex`: get the inde for block (or position) from the selected steps (blocks or positions).
   1. `clickBlock`: select block if the block is adjacent the the recent selected block and is not selected yet.
   1. `toggleBlock`: if the clicked block is last selected block, it can be unselected. if the clicked block is not selected and adjacent to the recent block, select the block.
   1. `isPositionAdjacent`: is one position adjacent to another position
   1. `getPositionKey`: the string representation o a `Position`

# Components
1. `<RouterProvider>`
   1. `<ChessProvider>`
      1. `/`: `<Stage1>`
      1. `/setup`: `<Stage1>`
      1. `/play`: `<Stage2>`
         1. `<Blocks><BlockMemo>...</Blocks>`
         1. `<SelectedBlocks><SelectedBlockMemo>...</SelectedBlocks>`
      1. `/result`: `<Stage3>`
         1. `<SelectedSteps>`

# Styles Helpers
1. `<Stage1>`: use `STAGE1_*STYLE`
1. `<Stage2>`: use `STAGE2_*STYLE`, `stage2Style()`
1. `<Stage3>`: use `STAGE3_STYLE`

# Screenshots

## step1
![step 1](./doc/chess_step1.png)

## step2
![step 2(a)](./doc/chess_step2a.png)
![step 2(b)](./doc/chess_step2b.png)

## step3
![step 3](./doc/chess_step3.png)

## re-rendering optimization
only re-render components that is changed, as shown in the bottom two lines, which is mostly greyout (not render). a list of child `<Block/>` for parent `<Blocks>` and a list of child `<SelectedBlock/>` for parent `<SelecteBlocks/>`.
![step 3](./doc/chess_rerendering_optimization.png)