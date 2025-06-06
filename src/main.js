// --------------------------------------------------------------------------------------------

// PRIORITY OPTION
const priorityBoxes = document.querySelectorAll('.priorities > button');
let selectedBox = null;

priorityBoxes.forEach(box => {
    box.addEventListener('mouseenter', () => {
        if (box !== selectedBox) {
            box.style.opacity = '1';
        }
    });
  
    box.addEventListener('mouseleave', () => {
        if (box !== selectedBox) {
            box.style.opacity = '0.5';
        }
    });
  
    box.addEventListener('click', () => {
        if (selectedBox === box) {
            selectedBox = null;
            priorityBoxes.forEach(b => {
                b.style.opacity = '0.5';
            });
        } else {
            selectedBox = box;
            priorityBoxes.forEach(b => {
                b.style.opacity = (b === box) ? '1' : '0.5';
            });
        }
    });
});

// --------------------------------------------------------------------------------------------

// TO DO LIST
let priorityColor = {"LOW": "green", "MEDIUM": "orange", "HIGH": "red", "DEFAULT": "black"};
let priorityAbbr = {"LOW": "L", "MEDIUM": "M", "HIGH": "H", "DEFAULT": "D"};

function addTask() {
    let input = document.getElementById('taskInput');
    let taskText = input.value.trim();

    if (!taskText) {
        alert("Insert task description first!");
        document.getElementById("taskInput").focus();
        return;
    }

    if (isTaskDuplicated(taskText)) {
        alert("That task has already been added!");
        return;
    }

    if (selectedBox == null) {
        alert("Select the priority first!");
        return;
    }

    let dueDate = document.getElementById("overdueChoose");
    if (dueDate.value === "") {
        dueDate = null;
    } else {
        dueDate = dueDate.value;
    }
    
    let li = document.createElement('li');
    textContent = selectedBox.textContent;
    
    if (dueDate !== null && dueDate < getDayTag()) {
        // OVERDUE SINCE ADDED
        li.innerHTML = getOverdueElmtTemplate(taskText, priorityAbbr[textContent], priorityColor[textContent],
                       getDayTag(), dueDate);
        document.getElementById('overdueList').appendChild(li);
    } else {
        // NORMAL
        li.innerHTML = getListElmtTemplate(taskText, priorityAbbr[textContent], priorityColor[textContent],
                       null, dueDate);
        document.getElementById('taskList').appendChild(li);
    }

    saveTask(taskText, priorityAbbr[textContent], getDayTag(), dueDate);
    input.value = '';
    document.getElementById("overdueChoose").value = '';
}

function removeTask(button, taskText) {
    button.parentElement.parentElement.remove();

    let tasks = getTaskFromStorage();
    tasks = tasks.filter((task) => task.text !== taskText);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function toggleComplete(task) {
    const status = task.classList.toggle('completed');
    updateTasks(task);

    button = task.parentElement.parentElement.querySelector(".tagWrapper .doneButton");

    if (status) {
        button.innerHTML = `<i class="fas fa-undo-alt"></i>`;

        const doneList = document.getElementById('doneList');
        doneList.appendChild(task.parentElement.parentElement);
    } else {
        button.innerHTML = `<i class="fas fa-check"></i>`;

        const taskList = document.getElementById('taskList');
        taskList.appendChild(task.parentElement.parentElement);
    }
}

function getListElmtTemplate(taskText, priorityAbbr, color, date=null, dueDate=null, completed=false) {
    return (
        `<div class="taskWrapper">
            <div class="dateWrapper">
                <span class="dateTag">${date===null ? getDayTag() : date}</span>
                ${dueDate!==null ? `<span class="dueDateTag">${dueDate}</span>` : ''}
            </div>
            <span class="task ${completed ? 'completed' : ''}" onclick="toggleComplete(this)"><p>${taskText}</p></span>
         </div>
         <div class="tagWrapper">
             <span class="priorityTag" style="background-color: ${color};">${priorityAbbr}</span>
             <button class="deleteButton" onclick="removeTask(this, '${taskText}')"> <i class="fas fa-times"></i></button>
             <button class="doneButton" onclick="toggleComplete (
                this.closest('.tagWrapper').previousElementSibling.querySelector('.task')
                )">
                    ${completed ? '<i class="fas fa-undo-alt"></i>' : '<i class="fas fa-check"></i>'}
             </button>
         </div>`
    );
}

function isTaskDuplicated(taskText) {
    let tasks = getTaskFromStorage();
    tasks = tasks.filter((task) => task.text === taskText);
    return (tasks.length !== 0);
}

function deleteAllTask() {
    warning = confirm("Are you sure to delete all active tasks?");
    if (warning) {
        allTasks = document.getElementById("taskList");
        taskList.innerHTML = "";

        let tasks = getTaskFromStorage();
        tasks = tasks.filter(task => (task.completed === true || isOverdue(task) === true));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

// --------------------------------------------------------------------------------------------














// --------------------------------------------------------------------------------------------

// LOCAL STORAGE
document.addEventListener('DOMContentLoaded', loadTasks);

function getTaskFromStorage() {
    let tasks = localStorage.getItem('tasks');
    try {
        tasks = JSON.parse(tasks) || [];
    } catch (error) {
        console.log(error);
        tasks = [];
    }

    return (tasks);
}

function saveTask(taskText, priorityAbbr, date, dueDate) {
    let tasks = getTaskFromStorage();
    tasks.push({text: taskText, priority: priorityAbbr, date: date, dueDate: dueDate, completed: false});
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    let tasks = getTaskFromStorage();

    tasks.forEach((task) => {
        let li = document.createElement('li');
        
        let color = "black"
        if (task.priority === "L") {
            color = "green";
        } else if (task.priority === "M") {
            color = "orange";
        } else if (task.priority === "H") {
            color = "red";
        }

        if (isOverdue(task)) {
            // OVERDUE
            li.innerHTML = getOverdueElmtTemplate(task.text, task.priority, color, task.date, task.dueDate);
            document.getElementById('overdueList').appendChild(li);
        } else {
            // NORMAL
            li.innerHTML = getListElmtTemplate(task.text, task.priority, color, task.date, task.dueDate, task.completed);

            if (task.completed === false) {
                document.getElementById('taskList').appendChild(li);
            } else {
                document.getElementById('doneList').appendChild(li);
            }
        }
    });

    // AUTOMATIC REFRESH
    const now = new Date();
    const millisUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
    
    // Tunggu hingga tengah malam
    setTimeout(() => {
        loadTasks();
        // Refresh otomatis setiap 24 jam
        setInterval(loadTasks, 86400000);
    }, millisUntilMidnight);
}

function updateTasks(taskElmt) {
    let tasks = getTaskFromStorage();

    tasks.forEach((task) => {
        if (task.text === taskElmt.querySelector("p").textContent) {
            task.completed = !task.completed;
        }
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// --------------------------------------------------------------------------------------------

// OVERDUE
function isOverdue(task) {
    return (task.dueDate !== null && task.dueDate < getDayTag() 
            && task.completed === false);
}

function getOverdueElmtTemplate(taskText, priorityAbbr, color, date, dueDate) {
    return (
        `<div class="taskWrapper">
            <div class="dateWrapper">
                <span class="dateTag">${date}</span>
                <span class="dueDateTag">${dueDate}</span>
            </div>
            <span class="task"><p>${taskText}</p></span>
         </div>
         <div class="tagWrapper">
             <span class="priorityTag" style="background-color: ${color};">${priorityAbbr}</span>
             <button class="deleteButton" onclick="removeTask(this, '${taskText}')"> <i class="fas fa-times"></i></button>
         </div>`
    );
}

// --------------------------------------------------------------------------------------------














// --------------------------------------------------------------------------------------------

// PROFILE CARD
document.addEventListener('DOMContentLoaded', loadProfile);

function addName(name) {
    let nameHolder = document.getElementById('name');
    nameHolder.innerHTML = `<p><b>Name</b>: ${name}</p>`;
}

function addPosition(position) {
    let positionHolder = document.getElementById('position');
    positionHolder.innerHTML = `<p><b>Position</b>: ${position}</p>`;
}

function getProfileFromStorage() {
    let profile = localStorage.getItem('profile');
    try {
        profile = JSON.parse(profile) || {};
    } catch (error) {
        console.log(error);
        profile = {};
    }

    return (profile);
}

function loadProfile() {
    let profile = getProfileFromStorage();
    if (profile.name) {
        addName(profile.name);
    }
    if (profile.position) {
        addPosition(profile.position);
    }
}

// --------------------------------------------------------------------------------------------

// DATE AND TIME
function insertDateTime() {
    const today = new Date();
    
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    
    m = checkTime(m);
    s = checkTime(s);

    const days   = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July",
                    "August", "September", "October", "November", "December"];

    const dayName = days[today.getDay()];
    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    
    document.getElementById('time').innerHTML =  h + ":" + m + ":" + s;
    document.getElementById('date').textContent = `${dayName}, ${month} ${day}, ${year}`;

    setTimeout(insertDateTime, 1000);
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function getDayTag() {
    const today = new Date();

    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    return (`${year}-${checkTime(month)}-${checkTime(day)}`);
}

// --------------------------------------------------------------------------------------------

// EDIT PROFILE
const nameEdit = document.getElementById('nameEdit');
const positionEdit = document.getElementById('positionEdit');

const displayName = document.getElementById('name');
const displayPosition = document.getElementById('position');

const nameInput = document.getElementById('nameInput');
const positionInput = document.getElementById('positionInput');
const nameInputText = nameInput.querySelector('input');
const positionInputText = positionInput.querySelector('input');

let _name = getProfileFromStorage().name || "-";
let _position = getProfileFromStorage().position || "-";


nameEdit.addEventListener('click', () => {
    displayName.style.display = 'none';
    nameInput.style.display = 'flex';
    nameInput.style.flexDirection = 'row';

    nameInputText.focus();
    nameInputText.value = _name;
});

// Tekan ENTER untuk menyimpan
nameInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addName(nameInputText.value);
        displayName.style.display = 'inline-block';
        nameInput.style.display = 'none';
        
        _name = nameInputText.value;
        saveProfile(_name, _position);
    }
});


positionEdit.addEventListener('click', () => {
    displayPosition.style.display = 'none';
    positionInput.style.display = 'flex';
    positionInput.style.flexDirection = 'row';

    positionInputText.focus();
    positionInputText.value = _position;
});

// Tekan ENTER untuk menyimpan
positionInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addPosition(positionInputText.value);
        displayPosition.style.display = 'inline-block';
        positionInput.style.display = 'none';

        _position = positionInputText.value;
        saveProfile(_name, _position);
    }
});


function saveProfile(name, position) {
    let profile = {name: name, position: position};
    localStorage.setItem('profile', JSON.stringify(profile));
}

// --------------------------------------------------------------------------------------------