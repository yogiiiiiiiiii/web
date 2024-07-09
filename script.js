let currentStudent = 1;
let currentTopicIndex = 0;
let totalStudents;
let totalTopics;
let topicsData = [];

function generateTopics() {
    totalStudents = parseInt(document.getElementById('numStudents').value, 10);
    totalTopics = parseInt(document.getElementById('numTopics').value, 10);
    
    const topicsContainer = document.getElementById('topicsContainer');
    topicsContainer.innerHTML = '';

    for (let i = 1; i <= totalTopics; i++) {
        topicsContainer.innerHTML += `
            <div class="topic-container">
                <h3>Topic ${i}</h3>
                <label for="topicName${i}">Topic Name:</label>
                <input type="text" id="topicName${i}" name="topicName${i}" required><br>
                <label for="hard${i}">Number of hard questions:</label>
                <input type="number" id="hard${i}" name="hard${i}" min="0" required><br>
                <label for="medium${i}">Number of medium questions:</label>
                <input type="number" id="medium${i}" name="medium${i}" min="0" required><br>
                <label for="easy${i}">Number of easy questions:</label>
                <input type="number" id="easy${i}" name="easy${i}" min="0" required><br>
            </div>
        `;
    }
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
}

function generateQuestionForms() {
    const topicsForm = document.getElementById('topicsForm');
    const formData = new FormData(topicsForm);

    formData.forEach((value, key) => {
        const topicIndex = key.match(/\d+/)[0];
        const questionType = key.replace(/\d+/, '');

        if (!topicsData[topicIndex - 1]) {
            topicsData[topicIndex - 1] = {
                topicName: document.getElementById(`topicName${topicIndex}`).value,
                hard: Number(document.getElementById(`hard${topicIndex}`).value),
                medium: Number(document.getElementById(`medium${topicIndex}`).value),
                easy: Number(document.getElementById(`easy${topicIndex}`).value),
                responses: Array(totalStudents).fill(null).map(() => ({
                    "Not Attended": 0,
                    "Don't Understand the Question": 0,
                    "Don't Understand Basic": 0,
                    "Can't Apply": 0,
                    "Numerical Error": 0,
                    "Complete Error in Shading": 0,
                    "Complete": 0
                })),
                choiceCounts: {
                    "Not Attended": 0,
                    "Don't Understand the Question": 0,
                    "Don't Understand Basic": 0,
                    "Can't Apply": 0,
                    "Numerical Error": 0,
                    "Complete Error in Shading": 0,
                    "Complete": 0
                }
            };
        }
    });

    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'block';

    askQuestionsForTopic(currentTopicIndex);
}

function askQuestionsForTopic(topicIndex) {
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = `<h2>${topicsData[topicIndex].topicName}</h2>`;
    document.getElementById('studentTitle').textContent = `Student ${currentStudent}: ${topicsData[topicIndex].topicName}`;

    const topic = topicsData[topicIndex];
    for (let i = 1; i <= topic.hard; i++) {
        questionsContainer.innerHTML += generateQuestionHTML(topicIndex, 'hard', i);
    }
    for (let i = 1; i <= topic.medium; i++) {
        questionsContainer.innerHTML += generateQuestionHTML(topicIndex, 'medium', i);
    }
    for (let i = 1; i <= topic.easy; i++) {
        questionsContainer.innerHTML += generateQuestionHTML(topicIndex, 'easy', i);
    }

    restorePreviousResponses(topicIndex);
}

function generateQuestionHTML(topicIndex, difficulty, questionNum) {
    const topic = topicsData[topicIndex];
    const response = topic.responses[currentStudent - 1];
    const selectedValue = response ? response[difficulty + questionNum] : "Not Attended";

    return `
        <div class="question-container">
            <h4>${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Question ${questionNum}</h4>
            <select name="topic${topicIndex}_${difficulty}${questionNum}" onchange="updateChoiceCount(this, ${topicIndex})">
                <option value="Not Attended" ${selectedValue === 'Not Attended' ? 'selected' : ''}>Not Attended</option>
                <option value="Don't Understand the Question" ${selectedValue === "Don't Understand the Question" ? 'selected' : ''}>Don't Understand the Question</option>
                <option value="Don't Understand Basic" ${selectedValue === "Don't Understand Basic" ? 'selected' : ''}>Don't Understand Basic</option>
                <option value="Can't Apply" ${selectedValue === "Can't Apply" ? 'selected' : ''}>Can't Apply</option>
                <option value="Numerical Error" ${selectedValue === "Numerical Error" ? 'selected' : ''}>Numerical Error</option>
                <option value="Complete Error in Shading" ${selectedValue === "Complete Error in Shading" ? 'selected' : ''}>Complete Error in Shading</option>
                <option value="Complete" ${selectedValue === 'Complete' ? 'selected' : ''}>Complete</option>
            </select>
        </div>
    `;
}

function restorePreviousResponses(topicIndex) {
    const topic = topicsData[topicIndex];
    if (topic.responses[currentStudent - 1]) {
        const responses = topic.responses[currentStudent - 1];
        for (let key in responses) {
            const select = document.querySelector(`select[name="topic${topicIndex}_${key}"]`);
            if (select) {
                select.value = responses[key];
                updateChoiceCount(select, topicIndex);
            }
        }
    }
}

function updateChoiceCount(select, topicIndex) {
    const topic = topicsData[topicIndex];
    const response = topic.responses[currentStudent - 1];

    const nameParts = select.name.split('_');
    const difficulty = nameParts[1];
    const questionNum = nameParts[2];

    if (response) {
        response[`${difficulty}${questionNum}`] = select.value;

        // Update choice counts for this topic
        topic.choiceCounts[select.value]++;
    }
}

function prevTopic() {
    if (currentTopicIndex > 0) {
        currentTopicIndex--;
        askQuestionsForTopic(currentTopicIndex);
    }
}

function nextTopic() {
    if (currentTopicIndex < topicsData.length - 1) {
        currentTopicIndex++;
        askQuestionsForTopic(currentTopicIndex);
    } else {
        if (currentStudent < totalStudents) {
            currentStudent++;
            currentTopicIndex = 0;
            askQuestionsForTopic(currentTopicIndex);
        } else {
            generateReport();
        }
    }
}

function generateReport() {
    const reportContainer = document.getElementById('reportContainer');
    reportContainer.innerHTML = '';

    topicsData.forEach(topic => {
        reportContainer.innerHTML += `<h3>${topic.topicName}</h3>`;
        const ctx = document.createElement('canvas');
        reportContainer.appendChild(ctx);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(topic.choiceCounts),
                datasets: [{
                    label: `Responses for ${topic.topicName}`,
                    data: Object.values(topic.choiceCounts),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384']
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });

    document.getElementById('step3').style.display = 'none';
    document.getElementById('report').style.display = 'block';
}

function downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add the header row with options and "Main Issue"
    const headerRow = ["Topic Name", "Not Attended", "Don't Understand the Question", "Don't Understand Basic", "Can't Apply", "Numerical Error", "Complete Error in Shading", "Complete", "Main Issue"];
    csvContent += headerRow.join(",") + "\n";

    // Add the data rows for each topic
    topicsData.forEach(topic => {
        const dataRow = [
            topic.topicName,
            topic.choiceCounts["Not Attended"],
            topic.choiceCounts["Don't Understand the Question"],
            topic.choiceCounts["Don't Understand Basic"],
            topic.choiceCounts["Can't Apply"],
            topic.choiceCounts["Numerical Error"],
            topic.choiceCounts["Complete Error in Shading"],
            topic.choiceCounts["Complete"],
            getMaxIssue(topic.choiceCounts)
        ];
        csvContent += dataRow.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link); // Required for FF

    link.click();
}

function getMaxIssue(choiceCounts) {
    return Object.keys(choiceCounts).reduce((a, b) => choiceCounts[a] > choiceCounts[b] ? a : b);
}



function downloadGraph() {
    const reportContainer = document.getElementById('reportContainer');
    const canvas = reportContainer.querySelector('canvas');
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "graph_report.png";
    link.click();
}
