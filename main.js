import { MultiProgressBars } from "multi-progress-bars";
import * as chalk from "chalk";
import os from "os";
import cpuStats from "cpu-stats";

export async function run() {
  const readCPU = () => {
    return new Promise((resolve, reject) => {
      cpuStats(1000, function (error, result) {
        if (error) return reject(error);

        resolve(result);
      });
    });
  };

  const readMem = () => {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return usedMemory / totalMemory;
  };

  // Initialize mpb
  const mpb = new MultiProgressBars({
    initMessage: " antop :) ",
    anchor: "top",
    persist: true,
    border: true,
  });

  // TASKS start

  mpb.addTask("RAM", {
    type: "percentage",
    barTransformFn: chalk.green,
    nameTransformFn: chalk.bold,
  });

  // TASKS end

  const createCPULoadTasks = () => {
    const coreCount = os.cpus().length; // Get the number of CPU cores

    for (let i = 0; i < coreCount; i++) {
      mpb.addTask(`Core${i}`, {
        type: "percentage",
        barTransformFn: chalk.green,
        nameTransformFn: chalk.bold,
      });
    }
  };

  const updateCPULoadTasks = async () => {
    const cpuData = await readCPU();

    for (let i = 0; i < cpuData.length; i++) {
      console.log();

      mpb.updateTask(`Core${i}`, { percentage: cpuData[i].cpu / 100 });
    }
  };

  const checkCPUTemperature = () => {};

  createCPULoadTasks();

  setInterval(async () => {
    updateCPULoadTasks();

    mpb.updateTask("RAM", { percentage: readMem() });
  }, 500);

  await mpb.promise;
  console.log("Finish");
}
