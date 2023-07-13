/* eslint-disable react-refresh/only-export-components */
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import React, {
  memo,
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';

const EMPTY_FUNCTION = () => {
  /* */
};

export type Position = {
  x: number;
  y: number;
};

export const getPositionKey = (position?: Position): string => {
  if (position == null) {
    return '?.?';
  }
  const { x, y } = position;
  return `${x}.${y}`;
};

export const getPositionGridAreaID = (
  position: Position,
  prefix?: string,
): string => {
  return `${prefix ?? 'b'}-${position.x}-${position.y}`;
};

export const useSizeQueryParam = (defaultValue: string): number => {
  const [searchParams] = useSearchParams();
  return parseInt(searchParams.get('n') ?? defaultValue, 10);
};

export const useMaxStepsQueryParam = (defaultValue: string): number => {
  const [searchParams] = useSearchParams();
  return parseInt(searchParams.get('m') ?? defaultValue, 10);
};

export const usePositionQueryParam = (): Position | null => {
  const [searchParams] = useSearchParams();
  const x = parseInt(searchParams.get('x') ?? '-1', 10);
  const y = parseInt(searchParams.get('y') ?? '-1', 10);
  if (x === -1 || y === -1) {
    return null;
  }

  return { x, y } as Position;
};

export const useCurrentQueryParams = () => {
  const [searchParams] = useSearchParams();
  return searchParams.toString();
};

export const getNxN = (size: number): Position[] => {
  const array: Position[] = [];
  if (size == null) {
    return array;
  }

  for (let x = 1; x <= size; x++) {
    for (let y = 1; y <= size; y++) {
      array.push({ x, y });
    }
  }
  return array;
};

export const getNxNGridArea = (size: number): string => {
  const area: string[] = [];
  for (let x = 1; x <= size; x++) {
    const row: string[] = [];
    for (let y = 1; y <= size; y++) {
      const position: Position = { x, y };
      row.push(getPositionGridAreaID(position));
    }
    area.push(`'${row.join(' ')}'`);
  }
  return area.join(' ');
};

export type UseChessContextProps = {
  initSize: ReturnType<typeof useSizeQueryParam>;
  initMaxSteps: ReturnType<typeof useMaxStepsQueryParam>;
  initPosition: ReturnType<typeof usePositionQueryParam>;
};

export const useChessContext = (props: UseChessContextProps) => {
  const { initSize, initMaxSteps, initPosition } = props;

  const [size, setSize] = useState<number>(initSize);
  const [maxSteps, setMaxSteps] = useState<number>(initMaxSteps);
  const [selectedSteps, setSelectedSteps] = useState<Position[]>(() => [
    initPosition ?? getRandomBlock(size),
  ]);

  const sizeBlock = useMemo(() => 60, []);
  const sizeChess = useMemo<number>(() => sizeBlock * size, [size, sizeBlock]);

  const lastSelectedStep = useMemo<Position | undefined>(() => {
    const lastIndex = selectedSteps.length - 1;
    if (lastIndex < 0) {
      return undefined;
    }
    return selectedSteps[lastIndex];
  }, [selectedSteps]);

  const lastSelectedStepAdjacentSteps = useMemo(() => {
    const availableSteps = new Map<string, Position>();
    if (lastSelectedStep == null) {
      return availableSteps;
    }

    const unavailableSteps = [...selectedSteps, lastSelectedStep].reduce(
      (steps, step) => {
        const key = getPositionKey(step);
        steps.set(key, step);
        return steps;
      },
      new Map<string, Position>(),
    );

    const { x: i, y: j } = lastSelectedStep;
    for (let x = Math.max(1, i - 1); x <= Math.min(size, i + 1); x++) {
      for (let y = Math.max(1, j - 1); y <= Math.min(size, j + 1); y++) {
        const position: Position = { x, y };
        const key = getPositionKey(position);
        if (unavailableSteps.has(key)) {
          continue;
        }
        availableSteps.set(key, position);
      }
    }

    return availableSteps;
  }, [size, lastSelectedStep, selectedSteps]);

  const remainingStep = useMemo<number>(
    () => maxSteps - selectedSteps.length,
    [selectedSteps, maxSteps],
  );

  const isDone = useMemo<boolean>(() => {
    return remainingStep === 0;
  }, [remainingStep]);

  const nxn = useMemo<Position[]>(() => getNxN(size), [size]);

  const nxnGridArea = useMemo<string>(() => getNxNGridArea(size), [size]);

  useEffect(() => {
    const randomPosition = getRandomBlock(size);
    setSelectedSteps([initPosition ?? randomPosition]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  useEffect(() => {
    if (selectedSteps.length > 0) {
      return;
    }
    setSelectedSteps([getRandomBlock(size)]);
  }, [size, selectedSteps.length]);

  return {
    size,
    setSize,
    maxSteps,
    setMaxSteps,
    selectedSteps,
    setSelectedSteps,
    lastSelectedStep,
    lastSelectedStepAdjacentSteps,
    remainingStep,
    nxn,
    nxnGridArea,
    isDone,
    sizeChess,
    sizeBlock,
  };
};

export type ChessReturn = ReturnType<typeof useChessContext>;

export const useChess = () => useContext(ChessContext);

export const getRandomBlock = (size: number): Position => {
  const step: Position = {
    x: Math.ceil(Math.random() * size),
    y: Math.ceil(Math.random() * size),
  };
  return step;
};

export const getBlockSelectedIndex = (props: {
  position: Position;
  steps: Position[];
}): number => {
  const { position, steps } = props;
  const { x, y } = position;
  return steps.findIndex((step_i) => step_i.x === x && step_i.y === y);
};

export const isPositionEqual = (
  a: Position | undefined,
  b: Position | undefined,
): boolean => {
  if (a == null || b == null) {
    return false;
  }

  return a.x === b.x && a.y === b.y;
};

export const isPositionAdjacent = (
  a: Position | undefined,
  b: Position | undefined,
): boolean => {
  if (a == null || b == null) {
    return false;
  }

  const distanceX = Math.abs(a.x - b.x);
  const distanceY = Math.abs(a.y - b.y);
  const isTouched = Math.max(distanceX, distanceY) <= 1;
  return isTouched;
};

export const resetSelectedSteps = (props: { chess: ChessReturn }): void => {
  props.chess.setSelectedSteps([]);
};

export const selectBlock = (props: {
  chess: ChessReturn;
  position: Position;
}): void => {
  const { chess, position } = props;
  const { lastSelectedStep, setSelectedSteps, maxSteps, selectedSteps } = chess;
  if (maxSteps === selectedSteps.length) {
    return;
  } else if (lastSelectedStep == null) {
    setSelectedSteps([position]);
    return;
  } else {
    const isAdjacent = isPositionAdjacent(position, lastSelectedStep);
    if (isAdjacent) {
      setSelectedSteps((prevSelectedSteps) => [...prevSelectedSteps, position]);
    }
  }
};

export const unselectBlock = (props: {
  chess: ChessReturn;
  position: Position;
}) => {
  const { chess, position } = props;
  const { selectedSteps, setSelectedSteps, lastSelectedStep } = chess;
  if (
    lastSelectedStep == null ||
    lastSelectedStep.x !== position.x ||
    lastSelectedStep.y !== position.y
  ) {
    return;
  }

  const nextSelectedSteps = [...selectedSteps];
  nextSelectedSteps.pop();

  setSelectedSteps(nextSelectedSteps);
};

export const USE_CHESS_DEFAULT: ChessReturn = {
  size: 0,
  setSize: EMPTY_FUNCTION,
  maxSteps: 0,
  setMaxSteps: EMPTY_FUNCTION,
  selectedSteps: [],
  setSelectedSteps: EMPTY_FUNCTION,
  nxn: [],
  isDone: false,
  lastSelectedStep: undefined,
  lastSelectedStepAdjacentSteps: new Map<string, Position>(),
  sizeChess: 0,
  sizeBlock: 0,
  remainingStep: 0,
  nxnGridArea: '',
};

export const ChessContext = createContext<ChessReturn>(USE_CHESS_DEFAULT);

export type ChessProviderProps = Parameters<typeof ChessProvider>[0];

export const ChessProvider = (props: {
  initSize?: number;
  initMaxSteps?: number;
  initPosition?: Position;
  children?: React.ReactNode;
}): JSX.Element => {
  const SizeQueryParam = useSizeQueryParam('10');
  const MaxStepsQueryParam = useMaxStepsQueryParam('10');
  const PositionQueryParam = usePositionQueryParam();

  const initSize = props.initSize ?? SizeQueryParam;
  const initMaxSteps = props.initMaxSteps ?? MaxStepsQueryParam;
  const initPosition = props.initPosition ?? PositionQueryParam;

  const value = useChessContext({ initPosition, initSize, initMaxSteps });

  return (
    <ChessContext.Provider value={value}>
      <>{props.children ?? null}</>
    </ChessContext.Provider>
  );
};

export const selectedBlockStyle = (props: {
  position: Position;
  sizeBlock: number;
}): React.CSSProperties => {
  const { position, sizeBlock } = props;

  return {
    backgroundColor: 'yellow',
    width: `${sizeBlock}px`,
    height: `${sizeBlock}px`,
    display: 'grid',
    placeContent: 'center center',
    gridArea: `b-${position.x}-${position.y}`,
    zIndex: 1,
  };
};

export const getPositionFromBlockPosition = (
  attribute: string | undefined | null,
): Position => {
  if (attribute == null || attribute === '') {
    throw new Error('attribute must be no empty string');
  }
  const matched = attribute.match(/.*_\D+(\d+)-(\d+)/);
  if (matched == null) {
    throw new Error(`${attribute} does not have position index`);
  }
  const [_, x, y] = matched;
  return { x: parseInt(x, 10), y: parseInt(y, 10) } as Position;
};

export const SELECTED_BLOCK_TESTID = {
  root: (position: Position): string =>
    `CHESS_SELECTED_BLOCK_${getPositionGridAreaID(position, 'sb')}`,
  selectedBlocks: /CHESS_SELECTED_BLOCK_/,
};

export const SelectedBlock = (props: {
  dataTestid?: string;
  position: Position;
  chess: ChessReturn;
  style?: React.CSSProperties;
}): JSX.Element => {
  const { position, chess } = props;
  const dataTestid = props.dataTestid ?? SELECTED_BLOCK_TESTID.root(position);
  const { sizeBlock, selectedSteps } = chess;

  const index = useMemo(() => {
    const index = getBlockSelectedIndex({ position, steps: selectedSteps });
    return index === -1 ? null : index + 1;
  }, [position, selectedSteps]);

  const style: React.CSSProperties = useMemo(
    () => ({
      ...selectedBlockStyle({ sizeBlock, position }),
      ...(props.style ?? {}),
    }),
    [sizeBlock, position, props.style],
  );

  return (
    <div
      data-testid={dataTestid}
      style={style}
      onClick={() => unselectBlock({ chess, position })}
    >
      <>{index}</>
    </div>
  );
};

export const SelectedBlockMemo = memo(SelectedBlock, (prev) => {
  const {
    chess: { lastSelectedStep },
    position,
  } = prev;
  return isPositionAdjacent(lastSelectedStep, position);
});

export const SelectedBlocks = (props: { chess: ChessReturn }): JSX.Element => {
  const { chess } = props;
  const { selectedSteps } = chess;

  return (
    <>
      {selectedSteps.map((step_i, i) => (
        <SelectedBlockMemo key={i} position={step_i} chess={chess} />
      ))}
    </>
  );
};

export const blockStyle = (
  position: Position,
  sizeBlock: number,
): React.CSSProperties => ({
  backgroundColor: `${
    (position.x + position.y) % 2 === 1 ? 'white' : 'lightgrey'
  }`,
  width: `${sizeBlock}px`,
  height: `${sizeBlock}px`,
  display: 'grid',
  placeContent: 'center center',
  gridArea: `b-${position.x}-${position.y}`,
});

export const BLOCK_TESTID = {
  root: (position: Position): string =>
    `CHESS_BLOCK_${getPositionGridAreaID(position)}`,
  blocks: /CHESS_BLOCK_/,
};

export const Block = (props: {
  dataTestid?: string;
  position: Position;
  chess: ChessReturn;
  style?: React.CSSProperties;
}): JSX.Element => {
  const { position, chess } = props;
  const dataTestid = props.dataTestid ?? BLOCK_TESTID.root(position);
  const { sizeBlock } = chess;
  const style: React.CSSProperties = useMemo(
    () => ({ ...blockStyle(position, sizeBlock), ...(props.style ?? {}) }),
    [position, sizeBlock, props.style],
  );

  return (
    <div
      data-testid={dataTestid}
      style={style}
      onClick={() => {
        selectBlock({ chess, position });
      }}
    ></div>
  );
};

export const BlockMemo = memo(Block, (_prev, curr) => {
  const {
    chess: { lastSelectedStepAdjacentSteps },
    position,
  } = curr;

  return !lastSelectedStepAdjacentSteps.has(getPositionKey(position));
});

export const Blocks = (props: { chess: ChessReturn }): JSX.Element => {
  const { chess } = props;
  const { nxn } = chess;

  return (
    <>
      {nxn.map((position_i, i) => (
        <BlockMemo key={i} position={position_i} chess={chess} />
      ))}
    </>
  );
};

export const SELECTED_STEPS_TESTID = {
  root: 'CHESS_SELECTED_STEPS',
  selectedStepLI: (i: Position): string =>
    `CHESS_SELECTED_STEPS_${getPositionGridAreaID(i)}`,
  selectedStepLIRegexp: /CHESS_SELECTED_STEPS_/,
};

export type SelectedStepsProps = {
  dataTestid?: string;
};

export const SelectedSteps = (props: SelectedStepsProps): JSX.Element => {
  const { dataTestid = SELECTED_STEPS_TESTID.root } = props;
  const { selectedSteps } = useChess();

  return (
    <ol data-testid={dataTestid}>
      {selectedSteps.map((step_i, i) => (
        <li data-testid={SELECTED_STEPS_TESTID.selectedStepLI(step_i)} key={i}>
          ({step_i.x}, {step_i.y})
        </li>
      ))}
    </ol>
  );
};

export const setupChangeSize = (
  e: React.ChangeEvent<HTMLInputElement>,
  chess: ChessReturn,
): void => {
  const { setSize } = chess;
  let nextValue: number;
  try {
    nextValue = parseInt(e.target.value, 10);
  } catch {
    nextValue = 0;
  }
  setSize(nextValue);
};

export const setupChangeMaxSteps = (
  e: React.ChangeEvent<HTMLInputElement>,
  chess: ChessReturn,
): void => {
  const { setMaxSteps } = chess;
  let nextValue: number;
  try {
    nextValue = parseInt(e.target.value, 10);
  } catch {
    nextValue = 0;
  }
  setMaxSteps(nextValue);
};

export const SETUP_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gridTemplateRows: 'repeat(3, 1fr)',
  gridTemplateAreas: [
    "'size_label size_input'",
    "'max_steps_label max_steps_input'",
    "'next next'",
  ].join(' '),
  gap: '10px',
};

export const SETUP_SIZE_LABEL_STYLE: React.CSSProperties = {
  gridArea: 'size_label',
  placeSelf: 'center start',
};

export const SETUP_SIZE_INPUT_STYLE: React.CSSProperties = {
  gridArea: 'size_input',
};

export const SETUP_MAX_STEPS_LABEL_STYLE: React.CSSProperties = {
  gridArea: 'max_steps_label',
  placeSelf: 'center start',
};

export const SETUP_MAX_STEPS_INPUT_STYLE: React.CSSProperties = {
  gridArea: 'max_steps_input',
};

export const SETUP_NEXT_BUTTON_STYLE: React.CSSProperties = {
  gridArea: 'next',
};

export const SETUP_TESTID = {
  root: 'CHESS_SETUP',
  size: 'CHESS_SETUP_SIZE',
  maxSteps: 'CHESS_SETUP_MAX_STEPS',
  next: 'CHESS_SETUP_NEXT',
};

export type SetupProps = {
  dataTestid?: string;
};

export const Setup = (props: SetupProps): JSX.Element => {
  const { dataTestid = SETUP_TESTID.root } = props;
  const chess = useChess();
  const { size, maxSteps } = chess;
  const search = useCurrentQueryParams();
  const navigate = useNavigate();

  return (
    <div data-testid={dataTestid} style={SETUP_STYLE}>
      <div style={SETUP_SIZE_LABEL_STYLE}>Chess Board Size (nxn)</div>
      <input
        data-testid={SETUP_TESTID.size}
        style={SETUP_SIZE_INPUT_STYLE}
        placeholder="size (nxn)"
        type="number"
        value={size ?? 0}
        onChange={(e) => setupChangeSize(e, chess)}
      ></input>
      <div style={SETUP_MAX_STEPS_LABEL_STYLE}>Number of available steps</div>
      <input
        data-testid={SETUP_TESTID.maxSteps}
        style={SETUP_MAX_STEPS_INPUT_STYLE}
        placeholder="max steps"
        type="number"
        value={maxSteps}
        onChange={(e) => setupChangeMaxSteps(e, chess)}
      ></input>
      <button
        data-testid={SETUP_TESTID.next}
        style={SETUP_NEXT_BUTTON_STYLE}
        role="button"
        disabled={size <= 0 || maxSteps <= 0}
        onClick={() => {
          navigate({ pathname: '/play', search });
        }}
      >
        Next
      </button>
    </div>
  );
};

export const PLAY_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(4, 1fr)`,
  alignItems: 'center',
};

export const playBlockGridStyle = (
  props: Partial<ChessReturn>,
): React.CSSProperties => {
  const { size, sizeChess, nxnGridArea } = props;
  const style: React.CSSProperties = {
    border: '1px solid lightgrey',
    display: 'grid',
    gridTemplateColumns: size == null ? '' : `repeat(${size}, 1fr)`,
    gridTemplateRows: size !== null ? '' : `repeat(${size}, 1fr)`,
    gap: 0,
    width: sizeChess == null ? 0 : `${sizeChess}px`,
    height: sizeChess == null ? 0 : `${sizeChess}px`,
    margin: '0 auto',
    gridTemplateAreas: nxnGridArea == null ? '' : nxnGridArea,
  };
  return style;
};

type PlayBlockGridProps = {
  chess: ChessReturn;
  style?: React.CSSProperties;
  dataTestid?: string;
  children?: React.ReactNode;
};

export const PlayBlockGrid = (props: PlayBlockGridProps): JSX.Element => {
  const { chess } = props;
  const dataTestid = props.dataTestid ?? PLAY_TESTID.board;
  const style = props.style ?? playBlockGridStyle(chess);

  return (
    <div style={style} data-testid={dataTestid}>
      {props.children ?? null}
    </div>
  );
};

export const pressArrow = (
  chess: ChessReturn,
  computeNextPosition: (position: Position) => Partial<Position>,
) => {
  const {
    lastSelectedStep,
    size,
    setSelectedSteps,
    selectedSteps,
    remainingStep,
  } = chess;
  if (lastSelectedStep == null) {
    return;
  }

  const soonSelectedStep = computeNextPosition(lastSelectedStep);
  const nextSelectedStep = {
    ...lastSelectedStep,
    ...soonSelectedStep,
  };

  const { x, y } = nextSelectedStep;
  if (x <= 0 || y <= 0 || size < x || size < y) {
    return;
  }

  const beforeLastSelectedStep = selectedSteps.at(-2);
  if (isPositionEqual(beforeLastSelectedStep, nextSelectedStep)) {
    setSelectedSteps((prevSelectedSteps) =>
      prevSelectedSteps.filter((_, i) => i !== prevSelectedSteps.length - 1),
    );
  }
  if (remainingStep === 0) {
    return;
  }
  if (selectedSteps.every((step) => !isPositionEqual(step, nextSelectedStep))) {
    setSelectedSteps((prevSelectedSteps) => [
      ...prevSelectedSteps,
      nextSelectedStep,
    ]);
  }
};

export const pressArrowUp = (chess: ChessReturn): void => {
  pressArrow(chess, ({ x }) => ({ x: x - 1 }));
};

export const pressArrowDown = (chess: ChessReturn): void => {
  pressArrow(chess, ({ x }) => ({ x: x + 1 }));
};

export const pressArrowLeft = (chess: ChessReturn): void => {
  pressArrow(chess, ({ y }) => ({ y: y - 1 }));
};

export const pressArrowRight = (chess: ChessReturn): void => {
  pressArrow(chess, ({ y }) => ({ y: y + 1 }));
};

export const onPressArrow = (
  chess: ChessReturn,
): ((event: KeyboardEvent) => void) => {
  return (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowUp':
        pressArrowUp(chess);
        return;
      case 'ArrowDown':
        pressArrowDown(chess);
        return;
      case 'ArrowLeft':
        pressArrowLeft(chess);
        return;
      case 'ArrowRight':
        pressArrowRight(chess);
        return;
      default:
    }
  };
};

export const PLAY_TESTID = {
  root: 'CHESS_PLAY',
  back: 'CHESS_PLAY_BACK',
  reset: 'CHESS_PLAY_RESET',
  next: 'CHESS_PLAY_NEXT',
  remainingStep: 'CHESS_PLAY_REMAINING_STEP',
  board: 'CHESS_PLAY_BOARD',
};

export type PlayProps = {
  dataTestid?: string;
};

export const Play = (props: PlayProps): JSX.Element => {
  const { dataTestid = PLAY_TESTID.root } = props;
  const search = useCurrentQueryParams();
  const navigate = useNavigate();
  const chess = useChess();
  const { remainingStep, isDone, maxSteps } = chess;

  useEffect(() => {
    const onPressArrowCallback = onPressArrow(chess);
    window.addEventListener('keydown', onPressArrowCallback);
    return () => {
      window.removeEventListener('keydown', onPressArrowCallback);
    };
  }, [chess]);

  return (
    <div style={{ width: '100%' }} data-testid={dataTestid}>
      <div style={PLAY_STYLE}>
        <div>
          <button
            role="button"
            data-testid={PLAY_TESTID.back}
            onClick={() => {
              navigate({ pathname: '/setup', search });
            }}
          >
            Back
          </button>
        </div>
        <div>
          <button
            role="button"
            data-testid={PLAY_TESTID.reset}
            onClick={() => resetSelectedSteps({ chess })}
          >
            Reset
          </button>
        </div>
        <div>
          <button
            role="button"
            disabled={!isDone}
            data-testid={PLAY_TESTID.next}
            onClick={() => {
              navigate({ pathname: '/thankyou', search });
            }}
          >
            Next
          </button>
        </div>
        <div data-testid={PLAY_TESTID.remainingStep}>
          Steps left: {remainingStep}/{maxSteps}
        </div>
      </div>
      <PlayBlockGrid chess={chess} dataTestid={PLAY_TESTID.board}>
        <Blocks chess={chess} />
        <SelectedBlocks chess={chess} />
      </PlayBlockGrid>
    </div>
  );
};

export const THANKYOU_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  width: '100%',
};

export const THANKYOU_TESTID = {
  root: 'CHESS_THANKYOU',
  selectedStepOL: 'CHESS_THANKYOU_SELECTED_STEPS',
  back: 'CHESS_THANKYOU_BACK',
  startOver: 'CHESS_THANKYOU_STARTOVER',
};

export type ThankyouProps = {
  dataTestid?: string;
};

export const Thankyou = (props: ThankyouProps): JSX.Element => {
  const { dataTestid = THANKYOU_TESTID.root } = props;
  const search = useCurrentQueryParams();
  const navigate = useNavigate();

  return (
    <div data-testid={dataTestid}>
      <div>
        <h2>Thank you! Your Steps</h2>
        <SelectedSteps dataTestid={THANKYOU_TESTID.selectedStepOL} />
      </div>
      <div style={THANKYOU_STYLE}>
        <div>
          <button
            data-testid={THANKYOU_TESTID.back}
            role="button"
            onClick={() => {
              navigate({ pathname: '/play', search });
            }}
          >
            Back
          </button>
        </div>
        <div>
          <button
            data-testid={THANKYOU_TESTID.startOver}
            role="button"
            onClick={() => {
              navigate({ pathname: '/setup', search });
            }}
          >
            START OVER
          </button>
        </div>
      </div>
    </div>
  );
};

export const AppProvider = (props: ChessProviderProps): JSX.Element => {
  const { children, initSize, initMaxSteps, initPosition } = props;

  return (
    <BrowserRouter basename="/">
      <ChessProvider
        initSize={initSize}
        initMaxSteps={initMaxSteps}
        initPosition={initPosition}
      >
        <>{children}</>
      </ChessProvider>
    </BrowserRouter>
  );
};

export const App = (): JSX.Element => {
  return (
    <AppProvider>
      <Routes>
        <Route Component={Setup} path="setup" />
        <Route Component={Play} path="play?size" />
        <Route Component={Thankyou} path="thankyou" />
        <Route Component={Play} path="*" />
      </Routes>
    </AppProvider>
  );
};
