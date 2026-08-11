"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Project } from "@/src/types/database";
import { createProject, updateProject, deleteProject } from "@/src/lib/actions/admin";
import { AdminCard, FormCheckbox, PageHeader, SelectField } from "@/src/components/admin/AdminCard";
import { DeleteButton } from "@/src/components/admin/DeleteButton";
import MediaUpload from "@/src/components/admin/MediaUpload";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { EmptyState } from "@/src/components/ui/LoadingSkeleton";
import { isVideoUrl } from "@/src/lib/supabase/upload";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
];

function ProjectForm({ project, onDone }: { project?: Project; onDone?: () => void }) {
  const [pending, startTransition] = useTransition();
  const isEdit = !!project;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = isEdit
        ? await updateProject(project.id, formData)
        : await createProject(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(isEdit ? "Project updated" : "Project created");
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="title" label="Title" defaultValue={project?.title} required />
        <Input name="category" label="Category" defaultValue={project?.category ?? ""} />
        <Input name="client" label="Client" defaultValue={project?.client ?? ""} />
        <Input name="location" label="Location" defaultValue={project?.location ?? ""} />
        <Input name="completion_date" label="Completion Date" type="date" defaultValue={project?.completion_date ?? ""} />
        <Input name="project_status" label="Project Status" defaultValue={project?.project_status ?? ""} />
        <Input name="sort_order" label="Sort Order" type="number" defaultValue={project?.sort_order ?? 0} />
        <SelectField name="status" label="Status" defaultValue={project?.status ?? "draft"} options={STATUS_OPTIONS} />
      </div>
      <MediaUpload
        name="cover_image_url"
        label="Cover Image or Video"
        bucket="projects"
        folder="covers"
        defaultValue={project?.cover_image_url}
        kind="media"
      />
      <Textarea name="description" label="Description" rows={2} defaultValue={project?.description ?? ""} />
      <Textarea name="details" label="Details" rows={3} defaultValue={project?.details ?? ""} />
      <div className="flex flex-wrap gap-4">
        <FormCheckbox name="is_featured" label="Featured" defaultChecked={project?.is_featured} />
        <FormCheckbox name="is_recent" label="Recent" defaultChecked={project?.is_recent} />
        <FormCheckbox name="is_trending" label="Trending" defaultChecked={project?.is_trending} />
      </div>
      <Button type="submit" loading={pending}>{isEdit ? "Update Project" : "Create Project"}</Button>
    </form>
  );
}

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage portfolio projects."
        actions={
          <Button onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Cancel" : "Add Project"}
          </Button>
        }
      />
      {showAdd && (
        <AdminCard title="Add New Project" className="mb-6">
          <ProjectForm onDone={() => setShowAdd(false)} />
        </AdminCard>
      )}
      <AdminCard title={`All Projects (${projects.length})`}>
        {projects.length === 0 ? (
          <EmptyState title="No projects yet" />
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    {p.cover_image_url && (
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {isVideoUrl(p.cover_image_url) ? (
                          <video src={p.cover_image_url} className="h-full w-full object-cover" muted />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-navy">{p.title}</h4>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{p.description}</p>
                      <p className="text-xs text-slate-400">{p.category} · {p.client}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === p.id ? null : p.id)}>
                      {editingId === p.id ? "Cancel" : "Edit"}
                    </Button>
                    <DeleteButton onDelete={() => deleteProject(p.id)} />
                  </div>
                </div>
                {editingId === p.id && (
                  <div className="mt-4 border-t pt-4">
                    <ProjectForm project={p} onDone={() => setEditingId(null)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
