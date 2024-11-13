function startSimulation() {
    const numProcesses = parseInt(document.getElementById("numProcesses").value);
    const timeQuantum = parseInt(document.getElementById("timeQuantum").value);

    if (isNaN(numProcesses) || isNaN(timeQuantum) || numProcesses <= 0 || timeQuantum <= 0) {
        alert("Please enter valid numbers for processes and time quantum.");
        return;
    }

    const processes = [];
    for (let i = 0; i < numProcesses; i++) {
        const burstTime = parseInt(document.getElementById(`burstTime${i}`).value);
        const arrivalTime = parseInt(document.getElementById(`arrivalTime${i}`).value);
        processes.push({ id: i + 1, burstTime, arrivalTime, remainingTime: burstTime });
    }

    simulateRoundRobin(processes, timeQuantum);
}

function simulateRoundRobin(processes, timeQuantum) {
    let currentTime = 0;
    let completedProcesses = 0;
    const queue = [];
    const ganttChart = document.getElementById("gantt-chart");
    ganttChart.innerHTML = ""; // Clear previous chart

    let waitingTime = {};
    let turnaroundTime = {};

    processes.forEach(p => {
        waitingTime[p.id] = 0;
        turnaroundTime[p.id] = 0;
    });

    function addArrivedProcesses() {
        // Add processes to queue based on arrival time
        processes.forEach(process => {
            if (process.arrivalTime <= currentTime && !queue.includes(process) && process.remainingTime > 0) {
                console.log(`Process ${process.id} added to queue at time ${currentTime}`);
                queue.push(process);
            }
        });
    }

    function processNext() {
        if (completedProcesses === processes.length) {
            displayMetrics(waitingTime, turnaroundTime);
            return;
        }

        addArrivedProcesses();  // Add arrived processes to the queue

        if (queue.length === 0) {
            currentTime++; // No process to run, move time forward
            setTimeout(processNext, 100); // Wait for the next tick
            return;
        }

        const process = queue.shift(); // Get the first process from the queue
        const timeSlice = Math.min(process.remainingTime, timeQuantum);

        // Visualize in Gantt Chart
        const processDiv = document.createElement("div");
        processDiv.className = "process";
        processDiv.style.width = `${timeSlice * 30}px`; // Adjust width for visualization
        processDiv.innerText = `P${process.id} (${currentTime} - ${currentTime + timeSlice})`;
        ganttChart.appendChild(processDiv);

        // Update time and remaining burst time
        currentTime += timeSlice;
        process.remainingTime -= timeSlice;

        if (process.remainingTime === 0) {
            turnaroundTime[process.id] = currentTime - process.arrivalTime;
            waitingTime[process.id] = turnaroundTime[process.id] - process.burstTime;
            completedProcesses++;
        } else {
            queue.push(process); // Re-add the process to the end of the queue if not finished
        }

        setTimeout(processNext, 100); // Continue to the next process in the queue
    }

    processNext(); // Start the simulation
}

function generateInputs() {
    const numProcesses = parseInt(document.getElementById("numProcesses").value);
    const processInputsDiv = document.getElementById("process-inputs");
    processInputsDiv.innerHTML = ''; // Clear previous inputs

    for (let i = 0; i < numProcesses; i++) {
        processInputsDiv.innerHTML += `
            <div>
                <label>Process ${i + 1} Burst Time: <input type="number" id="burstTime${i}" min="1" /></label>
                <label>Arrival Time: <input type="number" id="arrivalTime${i}" min="0" /></label>
            </div>
        `;
    }
}

function displayMetrics(waitingTime, turnaroundTime) {
    const metricsDiv = document.getElementById("metrics");
    metricsDiv.innerHTML = "<h3>Final Metrics</h3>";

    // Calculate total waiting time and turnaround time
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let numProcesses = Object.keys(waitingTime).length;

    Object.values(waitingTime).forEach(time => totalWaitingTime += time);
    Object.values(turnaroundTime).forEach(time => totalTurnaroundTime += time);

    // Calculate averages
    const avgWaitingTime = (totalWaitingTime / numProcesses).toFixed(2);
    const avgTurnaroundTime = (totalTurnaroundTime / numProcesses).toFixed(2);

    // Display the results
    metricsDiv.innerHTML += `<p>Average Waiting Time: ${avgWaitingTime}</p>`;
    metricsDiv.innerHTML += `<p>Average Turnaround Time: ${avgTurnaroundTime}</p>`;
}

