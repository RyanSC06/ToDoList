document.addEventListener('DOMContentLoaded', loadTasks);

function addTask() {
    let input = document.getElementById('taskInput');
    let taskText = input.value.trim();

    if (!taskText) {
        return;
    }

    let li = document.createElement('li');
    li.innerHTML = `<span onclick="toggleComplete(this)">${taskText}</span><button onclick="removeTask(this, '${taskText}')"> X </button>`;
    
    document.getElementById('taskList').appendChild(li);
    saveTask(taskText);

    input.value = '';
}

function removeTask(button, taskText) {
    button.parentElement.remove();

    let tasks = getTaskFromStorage();
    tasks = tasks.filter((task) => task.text !== taskText);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

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

function saveTask(taskText) {
    let tasks = getTaskFromStorage();
    tasks.push({text: taskText, completed: false});
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    let tasks = getTaskFromStorage();

    tasks.forEach((task) => {
        let li = document.createElement('li');
        li.innerHTML = `<span class="${task.completed ? 'completed' : ''}" onclick=:"toggleComplete(this)">${task.text}</span><button onclick="removeTask(this, ${task.text})"> X </button>`;
        document.getElementById('taskList').appendChild(li);
    });
}

function toggleComplete(task) {
    task.classList.toggle('completed');
    updateTasks(task);
}

function updateTasks(taskText) {
    let tasks = getTaskFromStorage();

    tasks.forEach((task) => {
        if (task.text === taskText.innerHTML) {
            task.completed = !task.completed;
        }
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}