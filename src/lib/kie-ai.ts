interface CreateTaskParams {
  model: string;
  input: {
    prompt: string;
    image_input: string[];
    aspect_ratio: string;
    resolution: string;
    output_format: string;
  };
  callBackUrl?: string;
}

interface CreateTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

interface TaskStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: string;
    param: string;
    resultJson: string | null;
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    completeTime: number | null;
    createTime: number;
  };
}

const KIE_AI_BASE_URL = "https://api.kie.ai/api/v1";

export async function createKieTask(params: CreateTaskParams): Promise<string> {
  const response = await fetch(`${KIE_AI_BASE_URL}/jobs/createTask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.KIE_AI_API_KEY}`,
    },
    body: JSON.stringify(params),
  });

  const data: CreateTaskResponse = await response.json();

  if (data.code !== 200) {
    throw new Error(`Kie.ai API error: ${data.msg}`);
  }

  return data.data.taskId;
}

export async function getKieTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const response = await fetch(
    `${KIE_AI_BASE_URL}/jobs/recordInfo?taskId=${taskId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.KIE_AI_API_KEY}`,
      },
    }
  );

  const data: TaskStatusResponse = await response.json();

  if (data.code !== 200) {
    throw new Error(`Kie.ai API error: ${data.msg}`);
  }

  return data;
}

export function extractGeneratedUrls(resultJson: string | null): string[] {
  if (!resultJson) return [];

  try {
    const parsed = JSON.parse(resultJson);
    return parsed.resultUrls || [];
  } catch (error) {
    console.error("Failed to parse resultJson:", error);
    return [];
  }
}
