import React, {
  memo,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import './App.css';

const EMPTY_FUNCTION = () => {
  /* */
};

type Position = {
  x: number;
  y: number;
};

const useChessContext = () => {
  const [stage, setStage] = useState<number>(1); // 1 = start, 2 = play, 3 = done,
  const [size, setSize] = useState<number>(10);
  const [maxSteps, setMaxSteps] = useState<number>(10);
  const [selectedSteps, setSelectedSteps] = useState<Position[]>([]);

  const lastSelectedStep = useMemo<Position | undefined>(() => {
    const lastIndex = selectedSteps.length - 1;
    if (lastIndex < 0) {
      return undefined;
    }
    return selectedSteps[lastIndex];
  }, [selectedSteps]);

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
  const sizeBlock = useMemo(() => 60, []);
  const sizeChess = useMemo<number>(() => sizeBlock * size, [size, sizeBlock]);
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

const setFristStepRandomly = (props: ChessReturn): void => {
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

const selectBlock = (props: {
  chess: ChessReturn;
  position: Position;
}): void => {
  const {
    chess: { lastSelectedStep, setSelectedSteps, maxSteps, selectedSteps },
    position,
  } = props;

  if (maxSteps === selectedSteps.length) {
    return;
  } else if (lastSelectedStep == null) {
    setSelectedSteps([position]);
    return;
  } else {
    const distanceX = Math.abs(position.x - lastSelectedStep.x);
    const distanceY = Math.abs(position.y - lastSelectedStep.y);
    const isAdjacent = Math.max(distanceX, distanceY) <= 1;
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

const toggleBlock = (props: {
  chess: ChessReturn;
  position: Position;
}): void => {
  const { chess, position } = props;
  const { setSelectedSteps, selectedSteps } = chess;
  const { x, y } = position;

  const index = selectedSteps.findIndex(
    (step_i) => step_i.x === x && step_i.y === y,
  );
  if (index === -1) {
    selectBlock({ chess, position });
  } else {
    setSelectedSteps((prevSelectedSteps) => {
      const nextSelectedSteps = [...prevSelectedSteps];
      nextSelectedSteps.splice(index, 1);
      return nextSelectedSteps;
    });
  }
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
  stage: 0,
  setStage: EMPTY_FUNCTION,
  lastSelectedStep: undefined,
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

const BlockSelected = memo(
  (props: { sizeBlock: number; position: Position }): JSX.Element => {
    const { position, sizeBlock } = props;
    const chess = useChess();
    const { selectedSteps } = chess;
    const size = `${sizeBlock}px`;

    const index = useMemo(() => {
      const index = getBlockSelectedIndex({ position, steps: selectedSteps });
      return index === -1 ? null : index + 1;
    }, [position, selectedSteps]);

    const style: React.CSSProperties = useMemo(
      () => ({
        backgroundColor: 'yellow',
        width: size,
        height: size,
        display: 'grid',
        placeContent: 'center center',
        gridArea: `b-${position.x}-${position.y}`,
        zIndex: 1,
      }),
      [size, position],
    );

    return (
      <div style={style} onClick={() => unselectBlock({ chess, position })}>
        <>{index}</>
      </div>
    );
  },
);

const Block = memo(
  (props: { sizeBlock: number; position: Position }): JSX.Element => {
    const { position, sizeBlock } = props;
    const chess = useChess();

    const style: React.CSSProperties = useMemo(
      () => ({
        backgroundColor: `${
          (position.x + position.y) % 2 === 1 ? 'white' : 'lightgrey'
        }`,
        width: `${sizeBlock}px`,
        height: `${sizeBlock}px`,
        display: 'grid',
        placeContent: 'center center',
        gridArea: `b-${position.x}-${position.y}`,
      }),
      [sizeBlock, position],
    );

    return (
      <div style={style} onClick={() => toggleBlock({ chess, position })}></div>
    );
  },
);

const Blocks = (): JSX.Element => {
  const chess = useChess();
  const { nxn, size, sizeChess, sizeBlock, nxnGridArea, selectedSteps } = chess;

  const style: React.CSSProperties = useMemo(
    () => ({
      border: '1px solid lightgrey',
      display: 'grid',
      gridTemplateColumns: `repeat(${size}, 1fr)`,
      gridTemplateRows: `repeat(${size}, 1fr)`,
      gridTemplateAreas: nxnGridArea,
      gap: 0,
      width: `${sizeChess}px`,
      height: `${sizeChess}px`,
      margin: '0 auto',
    }),
    [size, sizeChess, nxnGridArea],
  );

  return (
    <div style={style}>
      {nxn.map((position_i, i) => (
        <Block key={i} position={position_i} sizeBlock={sizeBlock} />
      ))}
      {selectedSteps.map((step_i, i) => (
        <BlockSelected key={i} position={step_i} sizeBlock={sizeBlock} />
      ))}
    </div>
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

const Step1ChangeMaxSteps = (
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

const STEP1_STYLE: React.CSSProperties = {
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

const STEP1_SIZE_LABEL_STYLE: React.CSSProperties = {
  gridArea: 'size_label',
  placeSelf: 'center start',
};

const STEP1_SIZE_INPUT_STYLE: React.CSSProperties = {
  gridArea: 'size_input',
};

const STEP1_MAX_STEPS_LABEL_STYLE: React.CSSProperties = {
  gridArea: 'max_steps_label',
  placeSelf: 'center start',
};

const STEP1_MAX_STEPS_INPUT_STYLE: React.CSSProperties = {
  gridArea: 'max_steps_input',
};

const STEP1_NEXT_BUTTON_STYLE: React.CSSProperties = {
 gridArea: 'next',
};

const Step1 = (): JSX.Element => {
  const chess = useChess();
  const { size, maxSteps, setStage } = chess;

  return (
    <div style={STEP1_STYLE}>
      <div style={STEP1_SIZE_LABEL_STYLE}>Chess Board Size (nxn)</div>
      <input
        style={STEP1_SIZE_INPUT_STYLE}
        placeholder="size (nxn)"
        type="number"
        value={size ?? 0}
        onChange={(e) => step1ChangeSize(e, chess)}
      ></input>
      <div style={STEP1_MAX_STEPS_LABEL_STYLE}>Number of available steps</div>
      <input
        style={STEP1_MAX_STEPS_INPUT_STYLE}
        placeholder="max steps"
        type="number"
        value={maxSteps}
        onChange={(e) => Step1ChangeMaxSteps(e, chess)}
      ></input>
      <button
        style={STEP1_NEXT_BUTTON_STYLE}
        role="button"
        disabled={size <= 0 || maxSteps <= 0}
        onClick={() => {
          setFristStepRandomly(chess);
          setStage(2);
        }}
      >
        Next
      </button>
    </div>
  );
};

const STEP2_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(3, 1fr)`,
};

const Step2 = (): JSX.Element => {
  const chess = useChess();
  const { setStage, remaingingStep, isDone, maxSteps } = chess;

  return (
    <div style={{ width: '100%' }}>
      <div style={STEP2_STYLE}>
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
      <Blocks />
    </div>
  );
};

const STEP3_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  width: '100%',
};

const Step3 = (): JSX.Element => {
  const { setStage } = useChess();

  return (
    <div>
      <div>
        <h2>Thank you! Your Steps</h2>
        <SelectedSteps />
      </div>
      <div style={STEP3_STYLE}>
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

const Steps = (): JSX.Element => {
  const chess = useChess();
  const { stage } = chess;

  switch (stage) {
    case 3:
      return <Step3 />;
    case 2:
      return <Step2 />;
    case 1:
    default:
      return <Step1 />;
  }
};

function App(): JSX.Element {
  return (
    <ChessProvider>
      <Steps />
    </ChessProvider>
  );
}

export default App;
