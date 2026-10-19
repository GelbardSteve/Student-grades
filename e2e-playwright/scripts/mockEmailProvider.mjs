// Stand-in for the Brevo email API during local tests: accepts every send and logs nothing sensitive.
// The local Edge Function reaches it through BREVO_API_URL in supabase/functions/.env.
import http from 'node:http';

http
  .createServer((req, res) => {
    req.resume();
    req.on('end', () => {
      res.writeHead(req.method === 'POST' ? 201 : 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ messageId: '<mock@brevo>' }));
    });
  })
  .listen(4010, '0.0.0.0', () => console.log('Mock email provider on :4010'));
