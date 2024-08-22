export default function handler(req, res) {
  if (req.method === 'POST') {
    // POSTリクエストの処理
    const { query, values } = req.body;
    // ここでデータベース操作を行う（仮の実装）
    console.log('受け取ったクエリ:', query);
    console.log('受け取った値:', values);
    res.status(200).json({ message: 'データを保存しました' });
  } else if (req.method === 'GET') {
    // GETリクエストの処理
    // ここで会話履歴を取得する（仮の実装）
    res.status(200).json({ messages: [] });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}