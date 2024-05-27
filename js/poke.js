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

function updateGrid() {
    const grid = document.getElementById('grid');
    const activeOptions = headers.filter(header => document.getElementById(`option${header}`).checked);

    if (activeOptions.length < 1) {
        grid.innerHTML = '';
        return;
    }

    let html = '<table><thead><tr><th></th>';
    activeOptions.forEach(option => {
        html += `<th><span class="${option}">${option}</span></th>`;
    });
    html += '</tr></thead><tbody>';
    activeOptions.forEach(rowOption => {
        html += `<tr><td><span class="${rowOption}">${rowOption}</span></td>`;
        activeOptions.forEach(colOption => {
            value = matrix[colOption][rowOption];
            // html += `<td><span class="two">2</span></td>`;
            // displayValue = value === 1?"":value;
            if(value === 2) {
                html += `<td><span class="two">2</span></td>`;
            } else if (value === 1) {
                html += `<td><span class="one"></span></td>`;
            } else if (value === 0.5) {
                html += `<td><span class="half">1/2</span></td>`;
            } else {
                html += `<td><span class="zero">0</span></td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    grid.innerHTML = html;
}