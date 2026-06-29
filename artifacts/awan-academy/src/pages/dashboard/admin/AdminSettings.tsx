import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAdminResetPassword } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const passwordSchema = z.object({
  userId: z.string().uuid("Please enter a valid user ID"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export function AdminSettings() {
  const { toast } = useToast();
  const resetPassword = useAdminResetPassword();
  const [profiles, setProfiles] = useState<{ id: string; full_name: string; email: string; role: string }[]>([]);
  const [academy, setAcademy] = useState({ academy_name: 'The Awan Academy', email: 'awansacademy@gmail.com', phone: '+92 333 1962657' });
  const [savingInfo, setSavingInfo] = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('id,full_name,email,role').order('full_name').then(({ data }) => setProfiles(data ?? []));
    supabase.from('settings').select('key,value').in('key', ['academy_name','email','phone']).then(({ data }) => {
      if (!data) return;
      setAcademy(current => ({ ...current, ...Object.fromEntries(data.map(item => [item.key, String(item.value ?? '')])) }));
    });
  }, []);

  async function saveAcademyInfo() {
    setSavingInfo(true);
    const rows = Object.entries(academy).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
    setSavingInfo(false);
    if (error) toast({ variant: 'destructive', title: 'Update failed', description: error.message }); else toast({ title: 'Academy information updated' });
  }

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      userId: "",
      newPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof passwordSchema>) {
    resetPassword.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "User password has been reset successfully." });
          form.reset();
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Error", description: err.message || "Failed to reset password." });
        }
      }
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold tracking-tight">System Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /> Admin Password Reset</CardTitle>
            <CardDescription>Select a portal user and set a new password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User ID (UUID)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger></FormControl><SelectContent>{profiles.map(profile => <SelectItem key={profile.id} value={profile.id}>{profile.full_name} — {profile.role} ({profile.email})</SelectItem>)}</SelectContent></Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="At least 8 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={resetPassword.isPending}>
                  {resetPassword.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academy Information</CardTitle>
            <CardDescription>Update general public information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Academy Name</Label>
                <Input value={academy.academy_name} onChange={event => setAcademy({ ...academy, academy_name: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input value={academy.email} onChange={event => setAcademy({ ...academy, email: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input value={academy.phone} onChange={event => setAcademy({ ...academy, phone: event.target.value })} />
              </div>
              <Button variant="outline" onClick={() => void saveAcademyInfo()} disabled={savingInfo}>{savingInfo ? 'Updating…' : 'Update Info'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
