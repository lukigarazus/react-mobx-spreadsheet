import * as React from "react";
import { observable, action, computed } from "mobx";
import { observer } from "mobx-react";
import "./styles.css";
const ALPHABET = "qwertyuiopasdfghjklzxcvbnm"
  .toUpperCase()
  .split("")
  .sort();

const getArr = (n: number) =>
  Array(n)
    .fill(undefined)
    .map((el, i) => i);

class CellModel {
  public core: boolean;
  @observable
  public iValue: any;
  private parent: SheetModel;

  constructor(public row: number, public column: number, parent: SheetModel) {
    const value =
      !row || !column
        ? !row && !column
          ? ""
          : !row
          ? ALPHABET[column - 1]
          : row > 0
          ? row
          : ""
        : undefined;

    this.iValue = value;
    this.core = value !== undefined;
    this.parent = parent;
  }

  @computed
  get value() {
    if (this.iValue && this.iValue.match && this.iValue.match(/^=>\s*/)) {
      try {
        // @ts-ignore
        const SHEET = this.parent;
        // @ts-ignore
        return eval(`(()${this.iValue})()`);
      } catch (e) {
        console.log(e);
        return "#ERROR";
      }
    }
    return this.iValue;
  }

  @action
  setIValue(nV: any) {
    this.iValue = nV;
  }
}

class SheetModel {
  @observable
  public cells: CellModel[];
  public rows: { [key: string]: CellModel };
  constructor(size: number) {
    this.cells = getArr(size + 1)
      .map(el => getArr(size + 1).map(el2 => [el, el2]))
      .flat()
      .map(([row, column]: [number, number]) => {
        return new CellModel(row, column, this);
      });
    this.rows = this.cells.reduce((acc: any, c) => {
      if (c.core) {
        return acc;
      }
      if (acc[c.row]) {
        acc[c.row].push(c);
      } else {
        acc[c.row] = [c];
      }
      return acc;
    }, {});
    console.log(this.rows);
  }
}

const CoreCell = ({ value }: { value: string }) => (
  <div className="cell cell-core">{value}</div>
);

const ValuedCell = observer(({ model }: { model: CellModel }) => {
  const [focused, setFocused] = React.useState(false);
  return !focused ? (
    <div className="cell" onClick={() => setFocused(true)}>
      {model.value}
    </div>
  ) : (
    <div className="cell">
      <input
        autoFocus
        value={model.iValue}
        onBlur={() => {
          setFocused(false);
        }}
        onChange={ev => {
          model.setIValue(ev.target.value);
        }}
      />
    </div>
  );
});

@observer
class Cell extends React.Component<{ cellModel: CellModel }, {}> {
  model: CellModel;
  constructor(props) {
    super(props);
    this.model = props.cellModel;
  }
  render() {
    return this.model.core ? (
      <CoreCell value={this.model.value} />
    ) : (
      <ValuedCell model={this.model} />
    );
  }
}

class Sheet extends React.Component<{ size: number }> {
  model: SheetModel;
  constructor(props) {
    super(props);
    this.model = new SheetModel(props.size);
  }
  render() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${this.props.size + 1}, auto)`,
          gridTemplateRows: `repeat(${this.props.size + 1}, auto)`,
          gridGap: "1px",
          background: "black",
          border: "1px solid black"
        }}
      >
        {this.model.cells.map(c => (
          <Cell cellModel={c} />
        ))}
      </div>
    );
  }
}

export default function App() {
  const [size, setSize] = React.useState(20);
  return (
    <div className="App">
      <Sheet size={size} />
      <button
        onClick={() => {
          setSize(size + 1);
        }}
      >
        +
      </button>
    </div>
  );
}
