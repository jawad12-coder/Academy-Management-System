import { useEffect, useState } from 'react';
import { customFetch } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, RefreshCw, Reply, Send } from 'lucide-react';

type MessageRow = {
  id: string; sender_id: string; receiver_id: string; subject: string | null; body: string;
  type: string; status: string; created_at: string;
  sender?: { full_name: string; email: string; role: string } | null;
  receiver?: { full_name: string; email: string; role: string } | null;
};

export function MessagesPanel({ admin = false }: { admin?: boolean }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<MessageRow | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  async function load() {
    setLoading(true);
    try { setMessages(await customFetch<MessageRow[]>('/api/messages', { responseType: 'json' })); }
    catch (error: any) { toast({ variant: 'destructive', title: 'Could not load messages', description: error.message }); }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  function startReply(message: MessageRow) {
    setReplyTo(message);
    setSubject(`Re: ${message.subject || 'Portal message'}`);
    setBody('');
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      await customFetch('/api/messages', {
        method: 'POST', responseType: 'json',
        body: JSON.stringify({ receiverId: replyTo?.sender_id, subject, body, type: replyTo ? 'reply' : 'inquiry' }),
      });
      toast({ title: 'Message sent' });
      setBody(''); setSubject(''); setReplyTo(null); await load();
    } catch (error: any) { toast({ variant: 'destructive', title: 'Message failed', description: error.message }); }
    setSending(false);
  }

  async function markRead(message: MessageRow) {
    if (message.status === 'read' || message.receiver_id !== user?.id) return;
    await customFetch(`/api/messages/${message.id}/read`, { method: 'PATCH', responseType: 'json' });
    setMessages(current => current.map(item => item.id === message.id ? { ...item, status: 'read' } : item));
  }

  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between gap-3"><div><h1 className="text-3xl font-serif font-bold">Messages</h1><p className="text-muted-foreground">{admin ? 'Read parent messages and send replies.' : 'Contact academy administration securely.'}</p></div><Button variant="outline" onClick={() => void load()}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button></div>
    <div className="grid lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-2"><CardHeader><CardTitle>{replyTo ? `Reply to ${replyTo.sender?.full_name || 'sender'}` : admin ? 'Select a message to reply' : 'New Message'}</CardTitle></CardHeader><CardContent>
        {admin && !replyTo ? <p className="text-sm text-muted-foreground py-8 text-center">Choose Reply beside a parent message.</p> : <form onSubmit={send} className="space-y-3"><Input value={subject} onChange={event => setSubject(event.target.value)} placeholder="Subject" /><Textarea className="min-h-36" value={body} onChange={event => setBody(event.target.value)} placeholder="Write your message…" /><div className="flex gap-2">{replyTo && <Button type="button" variant="outline" onClick={() => { setReplyTo(null); setBody(''); }}>Cancel</Button>}<Button disabled={sending || !body.trim()}><Send className="h-4 w-4 mr-2" /> {sending ? 'Sending…' : 'Send'}</Button></div></form>}
      </CardContent></Card>
      <Card className="lg:col-span-3"><CardHeader><CardTitle>Conversation History</CardTitle></CardHeader><CardContent>{loading ? <p className="text-center py-10">Loading…</p> : messages.length === 0 ? <div className="text-center py-10 text-muted-foreground"><MessageSquare className="mx-auto mb-2 opacity-40" />No messages yet.</div> : <div className="space-y-3">{messages.map(message => {
        const incoming = message.receiver_id === user?.id;
        return <button key={message.id} type="button" onClick={() => void markRead(message)} className={`w-full text-left border rounded-lg p-4 ${incoming && message.status === 'unread' ? 'border-primary bg-primary/5' : ''}`}>
          <div className="flex justify-between gap-3"><div><p className="font-semibold">{message.subject || 'Portal message'}</p><p className="text-xs text-muted-foreground">{incoming ? `From ${message.sender?.full_name || 'User'}` : `To ${message.receiver?.full_name || 'Administration'}`} · {new Date(message.created_at).toLocaleString()}</p></div><div className="flex items-start gap-2"><Badge variant={incoming ? 'default' : 'secondary'}>{incoming ? 'Received' : 'Sent'}</Badge>{admin && incoming && <Button type="button" size="sm" variant="outline" onClick={event => { event.stopPropagation(); startReply(message); }}><Reply className="h-3 w-3 mr-1" /> Reply</Button>}</div></div>
          <p className="text-sm mt-3 whitespace-pre-wrap">{message.body}</p>
        </button>;
      })}</div>}</CardContent></Card>
    </div>
  </div>;
}
