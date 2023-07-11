import React, {
  memo,
  createContext,
  useContext,
  useMemo,
  useState,
  StrictMode,
} from 'react';
import './App.css';

const EMPTY_FUNCTION = () => {
  /* */
};

type Position = {
  x: number;
  y: number;
};

const getPositionKey = (position?: Position): string => {
  if (position == null) {
    return '?.?';
  }
  const { x, y } = position;
  return `${x}.${y}`;
};

const useChessContext = () => {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [size, setSize] = useState<number>(10);
  const [maxSteps, setMaxSteps] = useState<number>(10);
  const [selectedSteps, setSelectedSteps] = useState<Position[]>([]);

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

  const remaingingStep = useMemo<number>(
    () => maxSteps - selectedSteps.length,
    [selectedSteps, maxSteps],
  );

  const isDone = useMemo<boolean>(() => {
    return remaingingStep === 0;
  }, [remaingingStep]);

  const nxn = useMemo<Position[]>(() => {
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
  }, [size]);

  const nxnGridArea = useMemo<string>(() => {
    const area: string[] = [];
    for (let x = 1; x <= size; x++) {
      const row: string[] = [];
      for (let y = 1; y <= size; y++) {
        row.push(`b-${x}-${y}`);
      }
      area.push(`'${row.join(' ')}'`);
    }
    return area.join(' ');
  }, [size]);

  return {
    size,
    setSize,
    maxSteps,
    setMaxSteps,
    selectedSteps,
    setSelectedSteps,
    lastSelectedStep,
    lastSelectedStepAdjacentSteps,
    remaingingStep,
    nxn,
    nxnGridArea,
    isDone,
    stage,
    setStage,
    sizeChess,
    sizeBlock,
  };
};

type ChessReturn = ReturnType<typeof useChessContext>;

const useChess = () => useContext(ChessContext);

const setFristBlockRandomly = (props: ChessReturn): void => {
  const { size, setSelectedSteps } = props;
  const step1: Position = {
    x: Math.ceil(Math.random() * size),
    y: Math.ceil(Math.random() * size),
  };

  setSelectedSteps([step1]);
};

const getBlockSelectedIndex = (props: {
  position: Position;
  steps: Position[];
}): number => {
  const { position, steps } = props;
  const { x, y } = position;
  return steps.findIndex((step_i) => step_i.x === x && step_i.y === y);
};

const isPositionAdjacent = (
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

const selectBlock = (props: {
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

const unselectBlock = (props: { chess: ChessReturn; position: Position }) => {
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

const USE_CHESS_DEFAULT: ChessReturn = {
  size: 0,
  setSize: EMPTY_FUNCTION,
  maxSteps: 0,
  setMaxSteps: EMPTY_FUNCTION,
  selectedSteps: [],
  setSelectedSteps: EMPTY_FUNCTION,
  nxn: [],
  isDone: false,
  stage: 1,
  setStage: EMPTY_FUNCTION,
  lastSelectedStep: undefined,
  lastSelectedStepAdjacentSteps: new Map<string, Position>(),
  sizeChess: 0,
  sizeBlock: 0,
  remaingingStep: 0,
  nxnGridArea: '',
};

const ChessContext = createContext<ChessReturn>(USE_CHESS_DEFAULT);

const ChessProvider = (props: { children: JSX.Element }): JSX.Element => {
  const value = useChessContext();

  return (
    <ChessContext.Provider value={value}>
      <>{props.children}</>
    </ChessContext.Provider>
  );
};

const selectedBlockStyle = (props: {
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

const SelectedBlock = (props: {
  position: Position;
  chess: ChessReturn;
}): JSX.Element => {
  const { position, chess } = props;
  const { sizeBlock, selectedSteps } = chess;

  const index = useMemo(() => {
    const index = getBlockSelectedIndex({ position, steps: selectedSteps });
    return index === -1 ? null : index + 1;
  }, [position, selectedSteps]);

  const style: React.CSSProperties = useMemo(
    () => selectedBlockStyle({ sizeBlock, position }),
    [sizeBlock, position],
  );

  return (
    <div style={style} onClick={() => unselectBlock({ chess, position })}>
      <>{index}</>
    </div>
  );
};

const SelectedBlockMemo = memo(SelectedBlock, (prev) => {
  const {
    chess: { lastSelectedStep },
    position,
  } = prev;
  return isPositionAdjacent(lastSelectedStep, position);
});

const SelectedBlocks = (props: { chess: ChessReturn }): JSX.Element => {
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

const blockStyle = (
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

const Block = (props: {
  position: Position;
  chess: ChessReturn;
}): JSX.Element => {
  const { position, chess } = props;
  const { sizeBlock } = chess;
  const style: React.CSSProperties = useMemo(
    () => blockStyle(position, sizeBlock),
    [sizeBlock, position],
  );

  return (
    <div
      style={style}
      onClick={() => {
        selectBlock({ chess, position });
      }}
    ></div>
  );
};

const BlockMemo = memo(
  Block,
  (_prev, curr) =>
    !curr.chess.lastSelectedStepAdjacentSteps.has(
      getPositionKey(curr.position),
    ),
);

const Blocks = (props: { chess: ChessReturn }): JSX.Element => {
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

const SelectedSteps = (): JSX.Element => {
  const { selectedSteps } = useChess();

  return (
    <ol>
      {selectedSteps.map((step_i, i) => (
        <li key={i}>
          ({step_i.x}, {step_i.y})
        </li>
      ))}
    </ol>
  );
};

const step1ChangeSize = (
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

const step1ChangeMaxSteps = (
  e: React.ChangeEvent<HTMLInputElement>,
  setMaxSteps: React.Dispatch<React.SetStateAction<number>>,
): void => {
  let nextValue: number;
  try {
    nextValue = parseInt(e.target.value, 10);
  } catch {
    nextValue = 0;
  }
  setMaxSteps(nextValue);
};

const STAGE1_STYLE: React.CSSProperties = {
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

const STAGE1_SIZE_LABEL_STYLE: React.CSSProperties = {
  gridArea: 'size_label',
  placeSelf: 'center start',
};

const STAGE1_SIZE_INPUT_STYLE: React.CSSProperties = {
  gridArea: 'size_input',
};

const STAGE1_MAX_STEPS_LABEL_STYLE: React.CSSProperties = {
  gridArea: 'max_steps_label',
  placeSelf: 'center start',
};

const STAGE1_MAX_STEPS_INPUT_STYLE: React.CSSProperties = {
  gridArea: 'max_steps_input',
};

const STAGE1_NEXT_BUTTON_STYLE: React.CSSProperties = {
  gridArea: 'next',
};

const Stage1 = (): JSX.Element => {
  const chess = useChess();
  const { size, maxSteps, setMaxSteps, setStage } = chess;

  return (
    <div style={STAGE1_STYLE}>
      <div style={STAGE1_SIZE_LABEL_STYLE}>Chess Board Size (nxn)</div>
      <input
        style={STAGE1_SIZE_INPUT_STYLE}
        placeholder="size (nxn)"
        type="number"
        value={size ?? 0}
        onChange={(e) => step1ChangeSize(e, chess)}
      ></input>
      <div style={STAGE1_MAX_STEPS_LABEL_STYLE}>Number of available steps</div>
      <input
        style={STAGE1_MAX_STEPS_INPUT_STYLE}
        placeholder="max steps"
        type="number"
        value={maxSteps}
        onChange={(e) => step1ChangeMaxSteps(e, setMaxSteps)}
      ></input>
      <button
        style={STAGE1_NEXT_BUTTON_STYLE}
        role="button"
        disabled={size <= 0 || maxSteps <= 0}
        onClick={() => {
          setFristBlockRandomly(chess);
          setStage(2);
        }}
      >
        Next
      </button>
    </div>
  );
};

const STAGE2_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(3, 1fr)`,
};

const stage2Style = (
  size: number,
  sizeChess: number,
  nxnGridArea: string,
): React.CSSProperties => ({
  border: '1px solid lightgrey',
  display: 'grid',
  gridTemplateColumns: `repeat(${size}, 1fr)`,
  gridTemplateRows: `repeat(${size}, 1fr)`,
  gridTemplateAreas: nxnGridArea,
  gap: 0,
  width: `${sizeChess}px`,
  height: `${sizeChess}px`,
  margin: '0 auto',
});

const Stage2 = (): JSX.Element => {
  const chess = useChess();
  const {
    setStage,
    remaingingStep,
    isDone,
    maxSteps,
    nxnGridArea,
    size,
    sizeChess,
  } = chess;

  const style: React.CSSProperties = useMemo(
    () => stage2Style(size, sizeChess, nxnGridArea),
    [size, sizeChess, nxnGridArea],
  );

  return (
    <div style={{ width: '100%' }}>
      <div style={STAGE2_STYLE}>
        <div>
          <button role="button" onClick={() => setStage(1)}>
            Back
          </button>
        </div>
        <div>
          <button role="button" disabled={!isDone} onClick={() => setStage(3)}>
            Next
          </button>
        </div>
        <div>
          Steps left: {remaingingStep}/{maxSteps}
        </div>
      </div>
      <div style={style}>
        <Blocks chess={chess} />
        <SelectedBlocks chess={chess} />
      </div>
    </div>
  );
};

const STAGE3_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  width: '100%',
};

const Stage3 = (): JSX.Element => {
  const { setStage } = useChess();

  return (
    <div>
      <div>
        <h2>Thank you! Your Steps</h2>
        <SelectedSteps />
      </div>
      <div style={STAGE3_STYLE}>
        <div>
          <button role="button" onClick={() => setStage(2)}>
            Back
          </button>
        </div>
        <div>
          <button role="button" onClick={() => setStage(1)}>
            START OVER
          </button>
        </div>
      </div>
    </div>
  );
};

const Stages = (): JSX.Element => {
  const chess = useChess();
  const { stage } = chess;

  switch (stage) {
    case 3:
      return <Stage3 />;
    case 2:
      return <Stage2 />;
    case 1:
    default:
      return <Stage1 />;
  }
};

export const Top = (): JSX.Element => {
  return (
    <ChessProvider>
      <Stages />
    </ChessProvider>
  );
};

export const App = (props: { isProd: boolean }): JSX.Element => {
  const { isProd } = props;

  if (isProd) {
    return <Top />;
  }

  return (
    <StrictMode>
      <Top />
    </StrictMode>
  );
};
