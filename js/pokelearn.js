const csvData = `Attacking,Normal,Fire,Water,Electric,Grass,Ice,Fighting,Poison,Ground,Flying,Psychic,Bug,Rock,Ghost,Dragon,Dark,Steel,Fairy
Normal,1,1,1,1,1,1,1,1,1,1,1,1,0.5,0,1,1,0.5,1
Fire,1,0.5,0.5,1,2,2,1,1,1,1,1,2,0.5,1,0.5,1,2,1
Water,1,2,0.5,1,0.5,1,1,1,2,1,1,1,2,1,0.5,1,1,1
Electric,1,1,2,0.5,0.5,1,1,1,0,2,1,1,1,1,1,0.5,1,1,1
Grass,1,0.5,2,1,0.5,1,1,0.5,2,0.5,1,0.5,2,1,0.5,1,0.5,1
Ice,1,0.5,0.5,1,2,0.5,1,1,2,2,1,1,1,1,2,1,0.5,1
Fighting,2,1,1,1,1,2,1,0.5,1,0.5,0.5,0.5,2,0,1,2,2,0.5
Poison,1,1,1,1,2,1,1,0.5,0.5,1,1,1,0.5,0.5,1,1,0,2
Ground,1,2,1,2,0.5,1,1,2,1,0,1,0.5,2,1,1,1,2,1
Flying,1,1,1,0.5,2,1,2,1,1,1,1,2,0.5,1,1,1,0.5,1
Psychic,1,1,1,1,1,1,2,2,1,1,0.5,1,1,1,1,0,0.5,1
Bug,1,0.5,1,1,2,1,0.5,0.5,1,0.5,2,1,1,0.5,1,2,0.5,0.5
Rock,1,2,1,1,1,2,0.5,1,0.5,2,1,2,1,1,1,1,0.5,1
Ghost,0,1,1,1,1,1,1,1,1,1,2,1,1,2,1,0.5,1,1
Dragon,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,0.5,0
Dark,1,1,1,1,1,1,0.5,1,1,1,2,1,1,2,1,0.5,1,0.5
Steel,1,0.5,0.5,0.5,1,2,1,1,1,1,1,1,2,1,1,1,0.5,2
Fairy,1,0.5,1,1,1,1,2,0.5,1,1,1,1,1,1,2,2,0.5,1`;

function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const data = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));

    const matrix = {};
    headers.slice(1).forEach((header, i) => {
        matrix[header] = {};
        data.forEach(row => {
            matrix[header][row[0]] = parseFloat(row[i + 1]);
        });
    });
    return { headers: headers.slice(1), matrix };
}

const { headers, matrix } = parseCSV(csvData);
let currentQuestion = {};

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function generateQuestion() {
    const attackingType = headers[getRandomInt(headers.length)];
    const defendingType = headers[getRandomInt(headers.length)];
    currentQuestion = {
        attackingType,
        defendingType,
        answer: matrix[defendingType][attackingType]
    };
    document.getElementById('question').innerText = `${attackingType} vs ${defendingType}`;
    document.getElementById('result').innerText = '';
}

function checkAnswer(answer) {
    const resultElement = document.getElementById('result');
    if (answer === currentQuestion.answer) {
        resultElement.innerText = 'Correct!';
        resultElement.style.color = 'green';
    } else {
        resultElement.innerText = `Wrong! The correct answer is ${currentQuestion.answer}`;
        resultElement.style.color = 'red';
    }
    setTimeout(generateQuestion, 2000);
}

generateQuestion();