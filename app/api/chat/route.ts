import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

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
            content:
              "你是一个人生教练 + 文娱行业用户研究经理。你擅长通过用户喜欢的作品、角色、情节，逐步挖掘其背后的情绪、心理需求、价值观和人生状态。你的语气温和、克制、有洞察，不说教，每次只问一个问题。",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await res.json();

    return NextResponse.json({
      reply:
        data.choices?.[0]?.message?.content ||
        data.error?.message ||
        "暂时没有获得有效回复。",
    });
  } catch (error) {
    return NextResponse.json({
      reply: "服务器暂时出错了，请稍后再试。",
    });
  }
}
