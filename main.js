import { MultiProgressBars } from "multi-progress-bars";
import * as chalk from "chalk";
import os from "os";
import cpuStats from "cpu-stats";
import { spawn } from "child_process";

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

    return {
      percentage: usedMemory / totalMemory,
      totalMemory: (totalMemory / (1024 * 1024 * 1024)).toFixed(2),
      usedMemory: (usedMemory / (1024 * 1024 * 1024)).toFixed(2),
    };
  };

  // Initialize mpb
  const mpb = new MultiProgressBars({
    initMessage: ` antop :) ver. ${process.env.npm_package_version} `,
    anchor: "top",
    persist: true,
    border: true,
  });

  // create tasks start
  const createCPULoadTasks = () => {
    const coreCount = os.cpus().length; // Get the number of CPU cores

    for (let i = 0; i < coreCount; i++) {
      mpb.addTask(`Core${i}`, {
        type: "percentage",
        barTransformFn: chalk.red,
        nameTransformFn: chalk.bold,
      });
    }
  };

  const createRAMLoadTask = () => {
    mpb.addTask("RAM", {
      type: "percentage",
      barTransformFn: chalk.green,
      nameTransformFn: chalk.bold,
    });
  };
  // create task end

  // update task start
  const updateCPULoadTasks = async () => {
    const cpuData = await readCPU();

    for (let i = 0; i < cpuData.length; i++) {
      console.log();

      mpb.updateTask(`Core${i}`, {
        percentage: cpuData[i].cpu / 100,
      });
    }
  };

  const updateRAMLoadTask = () => {
    let memInfo = readMem();

    mpb.updateTask("RAM", {
      percentage: memInfo.percentage,
      message: `${memInfo.usedMemory} / ${memInfo.totalMemory} G`,
    });
  };
  // update task end

  // for now is not working
  // i will implement.
  const checkCPUTemperature = () => {
    let temp = spawn("cat", ["/sys/class/thermal/thermal_zone0/temp"]);

    temp.stdout.on("data", function (data) {
      console.log("Result: " + data / 1000 + " degrees Celcius");
    });
  };

  createCPULoadTasks();
  createRAMLoadTask();

  setInterval(async () => {
    updateCPULoadTasks();
    updateRAMLoadTask();
  }, 500);

  await mpb.promise;
  console.log("Finish");
}
