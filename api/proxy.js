// Vercelで動く「執事」のプログラム

export default async function handler(request, response) {
  // POST以外のリクエストは受け付けない
  if (request.method !== 'POST') {
    return response.status(405).json({ message: '許可されていないメソッドです' });
  }

  // ユーザーが送ってきたメッセージを取り出す
  const { prompt } = request.body;

  // メッセージが空ならエラーを返す
  if (!prompt) {
    return response.status(400).json({ error: 'promptが必要です' });
  }

  try {
    // ここが最重要！ Vercelの秘密の場所に保管したAPIキーを呼び出す
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // DeepSeekのAIにメッセージを送る
    const apiResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, // ここで秘密の鍵を使っている
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // 使用するモデル
        messages: [
          {
            "role": "user",
            "content": prompt
          }
        ],
      }),
    });

    const data = await apiResponse.json();
    
    // AIからの最初の返事を取り出して、ウェブサイトに送り返す
    const reply = data.choices[0].message.content;
    response.status(200).json({ reply: reply });

  } catch (error) {
    console.error('APIへのリクエスト中にエラーが発生しました:', error);
    response.status(500).json({ error: 'サーバーでエラーが発生しました。' });
  }
}