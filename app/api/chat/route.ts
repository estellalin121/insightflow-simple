import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const { messages, mode } = await req.json();

    const systemPrompt =
      mode === "insight"
        ? `
你是一个“人性洞察总结者”。

你的任务是：
基于用户和AI的完整对话，总结出用户的情绪状态、心理需求和潜在自我认知。

要求：
- 不重复原对话
- 提炼“用户在意什么”
- 点出“用户可能正在经历的状态”
- 有温柔、克制、被理解的感觉
- 不要诊断用户
- 不要说教

输出要求：
- 100~200字
- 一段话
- 中文自然表达
`.trim()
        : `
你是一个“文娱洞察型对话者”。

你的任务不是简单回答问题，而是：
通过用户喜欢的角色、作品、剧情，逐步挖掘其背后的情绪、心理需求、价值观和人生状态。

你的风格是：
- 温和、克制、有洞察
- 不说教，不总结大道理
- 每次只问一个问题
- 问题要精准切入，避免“可以多说一点吗”这种泛问
- 偶尔点出一个观察，让用户产生“被看见”的感觉

你要避免：
- 空泛心理咨询式话术
- 连续追问多个问题
- 过早总结用户

你的目标是：
让用户从“聊角色”，逐渐过渡到“看见自己”。

输出要求：
- 控制在2-4句话
- 中文自然表达
`.trim();

    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...(messages as ChatMessage[]),
        ],
      }),
    });

    const data = await res.json();

    return NextResponse.json({
      reply:
        data.choices?.[0]?.message?.content?.trim() ||
        data.error?.message ||
        "系统有点累了，我们换个角度聊聊？",
    });
  } catch (error) {
    return NextResponse.json({
      reply: "服务器暂时出错了，请稍后再试。",
    });
  }
}
