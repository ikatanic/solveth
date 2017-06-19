pragma solidity ^0.4.8;

contract Factorize {
    struct Task {
        uint n;
        uint reward;
        uint timestamp;
        bool solved;
    }

    Task[] tasks;

    function newTask(uint n) payable returns (uint) {
        if (msg.value > 0) {
            uint taskId = tasks.length;
            tasks.push(Task({
                n: n,
                reward: msg.value,
                timestamp: now,
                solved: false
            }));
            return taskId;
        } else {
            throw;
        }
    }

    function solveTask(uint taskId, uint factor) returns (uint) {
        if (taskId >= tasks.length) {
            throw;
        }
        Task task = tasks[taskId]; // reference to task
        if (task.solved) {
            throw;
        }
        if (!(1 < factor && factor < task.n && task.n % factor == 0)) {
            throw;
        }

        // task solved! send reward
        task.solved = true;
        if (!msg.sender.send(task.reward)) {
            throw;
        }
        return task.reward;
    }

    function getNumberOfTasks() constant returns (uint) {
        return tasks.length;
    }

    function getTask(uint taskId) constant returns (uint, uint, uint, uint, bool) {
        if (taskId >= tasks.length) {
            throw;
        }

        Task task = tasks[taskId];
        return (taskId, task.n, task.reward, task.timestamp, task.solved);
    }

}
