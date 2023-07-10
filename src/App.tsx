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
  const [maxSteps, setMaxSteps] = useState<number>(4);
  const [steps, setSteps] = useState<Position[]>([]);

  const lastStep = useMemo<Position | undefined>(() => {
    return steps.at(-1);
  }, [steps]);

  const remaingingStep = useMemo<number>(
    () => maxSteps - steps.length,
    [steps, maxSteps],
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
  const sizeBlock = 30;
  const sizeChess = useMemo<number>(() => sizeBlock * size, [size]);

  return {
    size,
    setSize,
    maxSteps,
    setMaxSteps,
    steps,
    setSteps,
    lastStep,
    nxn,
    isDone,
    stage,
    setStage,
    sizeChess,
    sizeBlock,
    remaingingStep,
  };
};

type ChessReturn = ReturnType<typeof useChessContext>;

const useChess = () => useContext(ChessContext);

const setFristPositionRandomly = (props: ChessReturn): void => {
  const { size, setSteps } = props;
  const step1: Position = {
    x: Math.ceil(Math.random() * size),
    y: Math.ceil(Math.random() * size),
  };

  setSteps([step1]);
};

const isBlockSelected = (props: {
  position: Position;
  steps: Position[];
}): boolean => {
  const { position, steps } = props;
  const { x, y } = position;
  const isFound =
    steps.find((step_i) => step_i.x === x && step_i.y === y) != null;
  return isFound;
};

const getBlockSelectedIndex = (props: {
  position: Position;
  steps: Position[];
}): number => {
  const { position, steps } = props;
  const { x, y } = position;
  return steps.findIndex((step_i) => step_i.x === x && step_i.y === y);
};

const clickBlock = (props: {
  chess: ChessReturn;
  position: Position;
}): void => {
  const {
    chess: { lastStep, setSteps, maxSteps, steps },
    position: { x, y },
  } = props;

  if (maxSteps === steps.length) {
    return;
  } else if (lastStep == null) {
    setSteps((prevSteps) => [...prevSteps, { x, y }]);
    return;
  } else {
    const { x: lastX, y: lastY } = lastStep;
    const isAdjacentX = Math.abs(x - lastX) === 1;
    const isAdjacentY = Math.abs(y - lastY) === 1;
    if (isAdjacentX || isAdjacentY) {
      setSteps((prevSteps) => [...prevSteps, { x, y }]);
    }
  }
};

const toggleBlock = (props: {
  chess: ChessReturn;
  position: Position;
}): void => {
  const { chess, position } = props;
  const { setSteps, steps } = chess;
  const { x, y } = position;

  const index = steps.findIndex((step_i) => step_i.x === x && step_i.y === y);
  if (index === -1) {
    clickBlock({ chess, position });
  } else {
    setSteps((prevSteps) => {
      const nextSteps = [...prevSteps];
      nextSteps.splice(index, 1);
      return nextSteps;
    });
  }
};

const USE_CHESS_DEFAULT: ChessReturn = {
  size: 0,
  setSize: EMPTY_FUNCTION,
  maxSteps: 0,
  setMaxSteps: EMPTY_FUNCTION,
  steps: [],
  setSteps: EMPTY_FUNCTION,
  nxn: [],
  isDone: false,
  stage: 0,
  setStage: EMPTY_FUNCTION,
  lastStep: undefined,
  sizeChess: 0,
  sizeBlock: 0,
  remaingingStep: 0,
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

const Block = memo((props: { position: Position }): JSX.Element => {
  const { position } = props;
  const { x, y } = position;
  const chess = useChess();
  const { sizeBlock, steps } = chess;
  const size = `${sizeBlock}px`;
  const isOdd = useMemo(() => (x + y) % 2 === 1, [x, y]);
  const isSelected = useMemo(() => {
    return isBlockSelected({ position, steps });
  }, [position, steps]);
  const index = useMemo(() => {
    const index = getBlockSelectedIndex({ position, steps });
    return index === -1 ? null : index + 1;
  }, [position, steps]);
  const style: React.CSSProperties = useMemo(
    () => ({
      backgroundColor: `${
        isSelected ? 'yellow' : isOdd ? 'white' : 'lightgrey'
      }`,
      width: size,
      height: size,
    }),
    [size, isOdd, isSelected],
  );

  return (
    <div style={style} onClick={(_e) => toggleBlock({ chess, position })}>
      <>{index}</>
    </div>
  );
});

const Blocks = (): JSX.Element => {
  const chess = useChess();
  const { nxn, size, sizeChess } = chess;

  const style: React.CSSProperties = {
    border: '1px solid lightgrey',
    display: 'grid',
    gridTemplateColumns: `repeat(${size}, 1fr)`,
    gridTemplateRows: `repeat(${size}, 1fr)`,
    gap: 0,
    width: `${sizeChess}px`,
    height: `${sizeChess}px`,
    margin: '0 auto',
  };

  return (
    <div style={style}>
      {nxn.map((position_i, i) => (
        <Block key={i} position={position_i} />
      ))}
    </div>
  );
};

const Steps = (): JSX.Element => {
  const { steps } = useChess();

  return (
    <ol>
      {steps.map((step_i, i) => (
        <li key={i}>
          ({step_i.x}, {step_i.y})
        </li>
      ))}
    </ol>
  );
};

const Stage1 = (): JSX.Element => {
  const chess = useChess();
  const { size, setSize, maxSteps, setMaxSteps, setStage } = chess;

  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
  };

  return (
    <div style={style}>
      <div>Chess Board Size (nxn)</div>
      <div>
        <input
          placeholder="size (nxn)"
          type="number"
          value={size}
          onChange={(e) => {
            setSize(parseInt(e.target.value, 10));
          }}
        ></input>
      </div>
      <div>Number of available steps</div>
      <div>
        <input
          placeholder="max steps"
          type="number"
          value={maxSteps}
          onChange={(e) => {
            setMaxSteps(parseInt(e.target.value, 10));
          }}
        ></input>
      </div>
      <div></div>
      <div>
        <button
          role="button"
          disabled={size <= 0 || maxSteps <= 0}
          onClick={(_e) => {
            setFristPositionRandomly(chess);
            setStage(2);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const Stage2 = (): JSX.Element => {
  const chess = useChess();
  const { setStage, remaingingStep, isDone, maxSteps } = chess;

  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(3, 1fr)`,
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={style}>
        <div>
          <button role="button" onClick={(_e) => setStage(1)}>
            Back
          </button>
        </div>
        <div>
          <button
            role="button"
            disabled={!isDone}
            onClick={(_e) => setStage(3)}
          >
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

const Stage3 = (): JSX.Element => {
  const { setStage } = useChess();

  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    width: '100%',
  };

  return (
    <div>
      <div>
        <h2>Thank you! Your Steps</h2>
        <Steps />
      </div>
      <div style={style}>
        <div>
          <button role="button" onClick={(_e) => setStage(2)}>
            Back
          </button>
        </div>
        <div>
          <button role="button" onClick={(_e) => setStage(1)}>
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

function App(): JSX.Element {
  return (
    <ChessProvider>
      <Stages />
    </ChessProvider>
  );
}

export default App;
