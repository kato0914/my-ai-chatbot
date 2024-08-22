import { Ai } from '@cloudflare/ai'

export interface Env {
  AI: any;
}

export default {
  async fetch(request: Request, env: Env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === 'POST') {
      const { messages } = await request.json() as { messages: any[] };
      
      // グローバルなAiオブジェクトを使用
      const ai = new (globalThis as any).Ai(env.AI);

      try {
        const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
          messages: messages,
          max_tokens: 256
        });

        return new Response(JSON.stringify(response), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('AI処理中にエラーが発生しました:', error);
        return new Response(JSON.stringify({ error: 'AI処理中にエラーが発生しました' }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    return new Response('Method Not Allowed', { 
      status: 405,
      headers: corsHeaders
    });
  }
};