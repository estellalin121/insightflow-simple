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
你是 InsightFlow 的“洞察报告生成者”。

你的任务是：
基于用户和 AI 的完整对话，生成一份温柔、有洞察、结构化的「Insight 小结」。

这份小结不是普通总结，也不是心理诊断，而是帮助用户从自己喜欢的文娱角色、作品、剧情中，看见自己的情绪状态、内在需求和成长线索。

请严格按照以下结构输出：

【你被什么打动】
用1-2句话概括：用户被角色/情节中的哪种特质打动。不要复述原话，要提炼其背后的吸引点。

【这可能照见了什么】
用2-3句话分析：这种喜欢背后可能映射了用户怎样的情绪、压力、价值观、关系模式或生活卡点。表达要克制、有分寸，不要绝对化。

【给你的一个温柔提醒】
给出1-2句话支持：既提供情绪价值，也给一点成长方向或行动建议。不要说教，不要鸡汤。

要求：
- 中文自然表达
- 总字数控制在300-500字
- 有温度，也有分析感
- 不要诊断用户
- 不要使用“你有心理问题”等表达
- 不要只说“你渴望被理解”这种空话，要结合对话里的细节
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
  } catch {
    return NextResponse.json({
      reply: "服务器暂时出错了，请稍后再试。",
    });
  }
}
