import { ITestCase } from "@/models/test-case";
import Docker from "dockerode";
import fs from "fs/promises";
import os from "os";
import path from "path";

const docker = new Docker();

interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  error?: string;
  runtime?: number;
}

interface DockerExecutionResult {
  status:
    | "Accepted"
    | "Wrong Answer"
    | "Time Limit Exceeded"
    | "Runtime Error"
    | "Compilation Error";
  runtime: number;
  memory: number;
  results: TestCaseResult[];
}

const LANGUAGE_CONFIGS = {
  python: {
    image: "python:3.9-alpine",
    cmd: ["python", "/app/solution.py"],
    ext: "py",
  },
  javascript: {
    image: "node:16-alpine",
    cmd: ["node", "/app/solution.js"],
    ext: "js",
  },
  java: {
    image: "openjdk:11-alpine",
    cmd: ["sh", "-c", "cd /app && javac Solution.java && java Solution"],
    ext: "java",
  },
  cpp: {
    image: "gcc:alpine",
    cmd: ["sh", "-c", "cd /app && g++ -o solution solution.cpp && ./solution"],
    ext: "cpp",
  },
};

export async function executeCodeWithDocker(
  code: string,
  language: string,
  testCases: ITestCase[]
): Promise<DockerExecutionResult> {
  const config = LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  await ensureImageExists(config.image);

  const results: TestCaseResult[] = [];
  let maxRuntime = 0;
  let maxMemory = 0;

  for (const testCase of testCases) {
    const result = await runDockerTestCase(code, config, testCase);
    results.push(result);
    if (result.runtime) maxRuntime = Math.max(maxRuntime, result.runtime);
    if (result.error) break;
  }

  const allPassed = results.every((r) => r.passed);
  const hasError = results.some(
    (r) => r.error && r.error !== "Time Limit Exceeded"
  );
  const hasTimeout = results.some((r) => r.error === "Time Limit Exceeded");

  const status: DockerExecutionResult["status"] = hasTimeout
    ? "Time Limit Exceeded"
    : hasError
    ? "Runtime Error"
    : allPassed
    ? "Accepted"
    : "Wrong Answer";

  return { status, runtime: maxRuntime, memory: maxMemory, results };
}

async function runDockerTestCase(
  code: string,
  config: any,
  testCase: ITestCase
): Promise<TestCaseResult> {
  const startTime = Date.now();
  const tmpFile = path.join(os.tmpdir(), `solution.${config.ext}`);
  await fs.writeFile(tmpFile, code);

  const container = await docker.createContainer({
    Image: config.image,
    Cmd: config.cmd,
    WorkingDir: "/app",
    HostConfig: {
      Memory: 128 * 1024 * 1024,
      CpuPeriod: 100000,
      CpuQuota: 50000,
      NetworkMode: "none",
      AutoRemove: true,
      Binds: [`${tmpFile}:/app/solution.${config.ext}:ro`],
    },
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    OpenStdin: true,
    StdinOnce: true,
  });

  const stream = await container.attach({
    stream: true,
    stdin: true,
    stdout: true,
    stderr: true,
  });

  let stdout = "";
  let stderr = "";

  const outputPromise = new Promise<void>((resolve) => {
    stream.on("data", (chunk: Buffer) => {
      const type = chunk[0];
      const text = chunk.slice(8).toString();
      if (type === 1) stdout += text;
      else if (type === 2) stderr += text;
    });
    stream.on("end", resolve);
  });

  if (testCase.input.trim()) stream.write(testCase.input + "\n");
  stream.end();
  await container.start();

  try {
    await Promise.race([
      outputPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 5000)
      ),
    ]);
  } catch (err: any) {
    await container.kill().catch(() => {});
    return {
      input: testCase.input,
      expectedOutput: testCase.output,
      passed: false,
      error: "Time Limit Exceeded",
      runtime: Date.now() - startTime,
    };
  }

  const runtime = Date.now() - startTime;

  if (stderr)
    return {
      input: testCase.input,
      expectedOutput: testCase.output,
      passed: false,
      error: stderr.trim(),
      runtime,
    };

  return {
    input: testCase.input,
    expectedOutput: testCase.output,
    actualOutput: stdout.trim(),
    passed: stdout.trim() === testCase.output.trim(),
    runtime,
  };
}

async function ensureImageExists(image: string) {
  try {
    await docker.getImage(image).inspect();
  } catch {
    await new Promise((resolve, reject) => {
      docker.pull(image, (err: any, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err) =>
          err ? reject(err) : resolve(null)
        );
      });
    });
  }
}
