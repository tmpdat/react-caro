import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    FormGroup,
    Input,
    Form,
    Container,
    Row,
    Col,
    Label,
    Jumbotron,
    Button
} from 'reactstrap';


function Square(props) {
    return (
        <button className="square" onClick={props.onClick} style={{background: props.partOfWinner}}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                partOfWinner={this.props.buttons[i]}
            />
        );
    }

    render() {
        const n = parseInt(this.props.n);
        var rowOfItems = Array(n).fill(0);
        var rowsOfItem = Array(n).fill(rowOfItems);
        for(var i = 0; i < n; i++)
        {
            for(var j = 0; j < n; j++)
            {
                rowsOfItem[i][j] = i * n + j;
            }
            rowsOfItem[i] = rowsOfItem[i].map((item) => this.renderSquare(item));
        }
        rowsOfItem = rowsOfItem.map((item) => <div className="board-row">
                {item}
            </div>
        );
        return (
            <div>
                {rowsOfItem}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor() {
        super();
        const squares = Array(25).fill(null);
        const buttons = Array(25).fill('');
        this.state = {
            stepNumber: 0,
            xIsNext: true,
            isDesc: true,
            winner: null,
            buttons: buttons,
            n: 5,
            fontWeights: Array(1000).fill(''),
            history: [
                {
                    squares: squares,
                    row: null,
                    col: null,
                }
            ],
            board: <Board
                squares={squares}
                onClick={i => this.handleClick(i)}
                n={5}
                buttons = {buttons}
            />
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const n = this.state.n;
        if(squares[i] || this.state.winner)
            return;
        squares[i] = this.state.xIsNext ? "X" : "O";
        let buttons = calculateWinner(squares, i, n);
        const fontWeights = Array(1000).fill('');
        const winner = buttons ? squares[i] : null;
        if(!buttons)
            buttons = Array(n*n).fill('');
        this.setState({
            fontWeights: fontWeights,
            buttons: buttons,
            history: history.concat([
                {
                    squares: squares,
                    col: i % n,
                    row: parseInt(i / n),
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            board: <Board
                squares={squares}
                onClick={i => this.handleClick(i)}
                n={n}
                buttons={buttons}
            />,
            winner: winner
        });
    }

    jumpTo(step) {
        const history = this.state.history;
        const current = history[step];
        const squares = current.squares.slice();
        const n = this.state.n;
        // if(step == history.length - 1 && this.state.winner)
        //     winner = squares[current.col + n*current.row];
        // else
        //     buttons = Array(n*n).fill('');
        let buttons = calculateWinner(squares, current.col + n*current.row, n);
        const winner = buttons ? squares[current.col + n*current.row] : null;
        if(!buttons)
            buttons = Array(n*n).fill('');
        let fontWeights = Array(1000).fill('');
        fontWeights[step - 1] = 'bold';
        this.setState({
            fontWeights: fontWeights,
            buttons: buttons,
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            board: <Board
                squares={squares}
                onClick={i => this.handleClick(i)}
                n={n}
                buttons={buttons}
            />,
            winner: winner
        });
    }

    createGame()
    {
        const n = document.getElementById('n').value;
        if(!n || n < 5 || n > 21)
        {
            alert("Kích thước chỉ nên từ 5 đến 20");
            return;
        }
        let fontWeights = Array(1000).fill('');
        const x = n*n;
        const buttons = Array(x).fill('');
        const squares = Array(x).fill(null);
        this.setState({
            winner: null,
            fontWeights: fontWeights,
            buttons: buttons,
            history: [
                {
                    squares: squares,
                    row: null,
                    col: null,
                }
            ],
            n: n,
            board: <Board
                squares={squares}
                onClick={i => this.handleClick(i)}
                n={n}
                buttons={buttons}
            />,
            xIsNext: true,
            stepNumber: 0
        });
    }

    reverseMoves()
    {
        let isDesc = this.state.isDesc;
        this.setState({
            isDesc: !isDesc,
        });
        this.render();
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = this.state.winner;
        const moves = history.map((step, move) => {
            let order;
            const move2 = history.length - move;
            if(!this.state.isDesc)
            {
                move = move2 - 1;
            }
            const col = history[move].col;
            const row = history[move].row;
            order = move ?
                'Go to move #' + move + ' at (' + col + ', ' + row + ')':
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)} style={{color: 'blue', fontWeight: this.state.fontWeights[move - 1]}}>
                        {order}
                    </button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        return (
            <div>
                <Navbar className="bg-dark">
                    <Row>
                        <Col sm={4}>
                            <h1 style={{margin:10}} className="text-muted">Cờ Caro</h1>
                        </Col>
                        <Col className="well" sm={8}>
                            <Form inline>
                                <Row style={{'margin-left':100, 'margin-top': 10,}}>
                                    <Col sm={4}><Label className='text-light'>Nhập khích thước</Label></Col>
                                    <Col sm={7}><Input id='n' type='text'/></Col>
                                    <Col sm={1}><Button outline color="light" onClick={() =>this.createGame()}>Vẽ</Button></Col>
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                </Navbar>

                <Jumbotron className=''>
                        <Row>
                            <Col sm={4}>
                                <div className="game">
                                    <div className="game-info">
                                        <div>{status}</div>
                                        <ol><Button outline color="dark" size='sm' onClick={() => this.reverseMoves()}>Sắp xếp lại</Button></ol>
                                        <ol>{moves}</ol>
                                    </div>
                                </div>
                            </Col>
                            <Col sm={8}>
                                <div className="game">
                                    <div className="game-board">
                                        {this.state.board}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                </Jumbotron>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares, i, n) {
    if(!squares[i])
        return null;
    let x = i % n;
    let y = parseInt(i / n);
    let count = 1;
    let buttons = Array(n*n).fill('');
    buttons[i] = 'blue';
    while(y > 0 && squares[(--y)*n + x] === squares[i])
    {
        buttons[(y)*n + x] = 'blue';
        count++;
        if(count >= 5)
        {
            return buttons;
        }
    }
    y = parseInt(i / n);
    while(y < n-1 && squares[(++y)*n + x] === squares[i])
    {
        buttons[(y)*n + x] = 'blue';
        count++;
        if(count >= 5)
        {
            return buttons;
        }
    }
    y = parseInt(i / n);
    count = 1;
    buttons = Array(n*n).fill('');
    buttons[i] = 'blue';
    while(x > 0 && squares[y*n + --x] === squares[i])
    {
        buttons[(y)*n + x] = 'blue';
        count++;
        if(count >= 5)
        {
            return buttons;
        }
    }
    x = i % n;
    while(x < n-1 && squares[y*n + ++x] === squares[i])
    {
        buttons[(y)*n + x] = 'blue';
        count++;
        if(count >= 5)
        {
            return buttons;
        }
    }
    x = i % n;
    count = 1;
    buttons = Array(n*n).fill('');
    buttons[i] = 'blue';
    while(x > 0 && y > 0 && squares[--y*n + --x] === squares[i])
    {
        buttons[(y)*n + x] = 'blue';
        count++;
        if(count >= 5)
        {
            return buttons;
        }
    }
    x = i % n;
    y = parseInt(i / n);
    while(x < n-1 && y < n-1 && squares[++y*n + ++x] === squares[i])
    {
        buttons[(y)*n + x] = 'blue';
        count++;
        if(count >= 5)
        {
            return buttons;
        }
    }
    x = i % n;
    y = parseInt(i / n);
    count = 1;
    buttons = Array(n*n).fill('');
    buttons[i] = 'blue';
    while(x > 0 && y < n-1 && squares[++y*n + --x] === squares[i])
    {
        buttons[(y)*n + x] = 'blue';
        count++;
        if(count >= 5)
        {
            return buttons;
        }
    }
    y = parseInt(i / n);
    x = i % n;
    while(x < n-1 && y > 0 && squares[--y*n + ++x] === squares[i])
    {
        buttons[(y)*n + x] = 'blue';
        count++;
        if(count >= 5)
        {
            return buttons;
        }
    }
    return null;
}