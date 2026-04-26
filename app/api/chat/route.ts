import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "你是一个擅长用户洞察的AI助手。" },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await res.json();

    console.log("OPENAI RESPONSE:", data); // 👈关键

    return NextResponse.json({
      reply: data.choices?.[0]?.message?.content || JSON.stringify(data),
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({
      reply: "服务器报错了",
    });
  }
}
