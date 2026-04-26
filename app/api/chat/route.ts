export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 临时返回（下一步我们再接真正的AI）
    return new Response(
      JSON.stringify({
        reply: `你刚刚说的是：「${message}」，这个功能马上会接入AI能力。`,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    );
  }
}
