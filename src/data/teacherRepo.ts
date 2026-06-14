/**
 * COUCHE D'ACCÈS — Espace enseignant (repository pattern, MAD §2.1).
 * Mode 'live' Supabase uniquement (RLS : un prof ne voit que ses propres classes/ressources).
 */
import { supabaseBrowser } from '@/lib/supabase/client';
import type { Klass, Program, TeacherResource, TeacherKind } from '@/types/db';

function joinCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export const classesRepo = {
  async listMine(): Promise<Klass[]> {
    const { data } = await supabaseBrowser().from('classes').select('*').order('created_at', { ascending: false });
    return (data as Klass[] | null) ?? [];
  },
  async create(input: {
    program: Program; class_key: string; serie?: string | null; subject?: string | null; name: string;
  }): Promise<Klass | null> {
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return null;
    const { data } = await sb
      .from('classes')
      .insert({
        teacher_id: auth.user.id,
        program: input.program,
        class_key: input.class_key,
        serie: input.serie ?? null,
        subject: input.subject ?? null,
        name: input.name,
        join_code: joinCode(),
      })
      .select('*')
      .single();
    return (data as Klass | null) ?? null;
  },
  async enrollmentCount(classId: string): Promise<number> {
    const { count } = await supabaseBrowser()
      .from('class_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId);
    return count ?? 0;
  },
};

export const resourcesRepo = {
  async listMine(): Promise<TeacherResource[]> {
    const { data } = await supabaseBrowser()
      .from('teacher_resources')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    return (data as TeacherResource[] | null) ?? [];
  },
  async save(input: {
    program: Program; class_key?: string | null; subject?: string | null; notion?: string | null;
    kind: TeacherKind; title?: string | null; content: string;
  }): Promise<void> {
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return;
    await sb.from('teacher_resources').insert({
      teacher_id: auth.user.id,
      program: input.program,
      class_key: input.class_key ?? null,
      subject: input.subject ?? null,
      notion: input.notion ?? null,
      kind: input.kind,
      title: input.title ?? null,
      content: input.content,
    });
  },
};
