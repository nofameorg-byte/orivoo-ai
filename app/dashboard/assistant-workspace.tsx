"use client";

import { useState, type FormEvent } from "react";
import {
  deleteAssistantConversation,
  loadAssistantConversation,
  loadAssistantProject,
  renameAssistantConversation,
} from "@/app/actions/assistant";
import { AssistantPrompt } from "@/app/dashboard/assistant-prompt";
import { ProjectMemoryPanel } from "@/app/dashboard/project-memory-panel";
import { ProjectSelector } from "@/app/dashboard/project-selector";
import type {
  AssistantModelId,
  SubscriptionTier,
} from "@/lib/assistant/models";
import {
  defaultAssistantStudioId,
  normalizeAssistantStudioId,
  type AssistantStudioId,
} from "@/lib/assistant/studios";
import type {
  AssistantConversation,
  AssistantMessage,
  AssistantProject,
  ProjectMemory,
} from "@/lib/assistant/types";

export function AssistantWorkspace({
  initialConversationId,
  initialConversations,
  initialMessages,
  initialProjects,
  initialSelectedModel,
  subscriptionTier,
}: {
  initialConversationId: string | null;
  initialConversations: AssistantConversation[];
  initialMessages: AssistantMessage[];
  initialProjects: AssistantProject[];
  initialSelectedModel: AssistantModelId;
  subscriptionTier: SubscriptionTier;
}) {
  const [activeConversationId, setActiveConversationId] = useState(
    initialConversationId,
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [conversations, setConversations] = useState(initialConversations);
  const [memory, setMemory] = useState<ProjectMemory[]>([]);
  const [messages, setMessages] = useState(initialMessages);
  const [projects, setProjects] = useState(initialProjects);
  const [selectedModel, setSelectedModel] = useState(initialSelectedModel);
  const [selectedStudio, setSelectedStudio] =
    useState<AssistantStudioId>(defaultAssistantStudioId);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [conversationActionError, setConversationActionError] = useState<
    string | null
  >(null);
  const [conversationToDelete, setConversationToDelete] =
    useState<AssistantConversation | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  function handleConversationSaved(conversation: AssistantConversation) {
    setConversations((currentConversations) =>
      [
        conversation,
        ...currentConversations.filter((item) => item.id !== conversation.id),
      ].sort(
        (first, second) =>
          new Date(second.updated_at).getTime() -
          new Date(first.updated_at).getTime(),
      ),
    );
  }

  function handleNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    setConversationActionError(null);
    setLoadError(null);
  }

  async function handleRenameConversation(conversationId: string, title: string) {
    setConversationActionError(null);

    const result = await renameAssistantConversation({
      conversationId,
      title,
    });

    if (!result.ok) {
      setConversationActionError(result.error);
      return false;
    }

    handleConversationSaved(result.conversation);
    return true;
  }

  async function handleConfirmDeleteConversation() {
    if (!conversationToDelete) {
      return;
    }

    setConversationActionError(null);
    const result = await deleteAssistantConversation(conversationToDelete.id);

    if (!result.ok) {
      setConversationActionError(result.error);
      return;
    }

    setConversations((currentConversations) =>
      currentConversations.filter(
        (conversation) => conversation.id !== result.conversationId,
      ),
    );

    if (activeConversationId === result.conversationId) {
      handleNewChat();
    }

    setConversationToDelete(null);
  }

  function handleProjectCreated(project: AssistantProject) {
    setProjects((currentProjects) => [
      project,
      ...currentProjects.filter((item) => item.id !== project.id),
    ]);
    setActiveProjectId(project.id);
    setActiveConversationId(null);
    setConversations([]);
    setMemory([]);
    setMessages([]);
    setSelectedStudio(normalizeAssistantStudioId(project.studio));
  }

  async function handleSelectProject(project: AssistantProject) {
    if (project.id === activeProjectId || isLoadingProject) {
      return;
    }

    setLoadError(null);
    setIsLoadingProject(true);

    try {
      const result = await loadAssistantProject(project.id);

      if (!result.ok) {
        setLoadError(result.error);
        return;
      }

      setActiveProjectId(result.projectId);
      setActiveConversationId(result.activeConversationId);
      setConversations(result.conversations);
      setMemory(result.memory);
      setMessages(result.messages);
      setSelectedStudio(normalizeAssistantStudioId(project.studio));
    } catch {
      setLoadError("Could not load that project. Please try again.");
    } finally {
      setIsLoadingProject(false);
    }
  }

  async function handleSelectConversation(conversationId: string) {
    if (
      conversationId === activeConversationId ||
      isLoadingConversation
    ) {
      return;
    }

    setLoadError(null);
    setIsLoadingConversation(true);

    try {
      const result = await loadAssistantConversation(conversationId);

      if (!result.ok) {
        setLoadError(result.error);
        return;
      }

      setActiveConversationId(result.conversationId);
      setMessages(result.messages);
    } catch {
      setLoadError("Could not load that conversation. Please try again.");
    } finally {
      setIsLoadingConversation(false);
    }
  }

  return (
    <>
      <ProjectSelector
        activeProjectId={activeProjectId}
        isLoading={isLoadingProject}
        onCreateProject={handleProjectCreated}
        onSelectProject={handleSelectProject}
        projects={projects}
        selectedStudio={selectedStudio}
      />

      <ProjectMemoryPanel
        activeProjectId={activeProjectId}
        memory={memory}
        onMemoryChange={setMemory}
      />

      <AssistantPrompt
        conversationId={activeConversationId}
        messages={messages}
        onConversationIdChange={setActiveConversationId}
        onConversationSaved={handleConversationSaved}
        onMessagesChange={setMessages}
        onSelectedModelChange={setSelectedModel}
        onSelectedStudioChange={setSelectedStudio}
        projectId={activeProjectId}
        selectedModel={selectedModel}
        selectedStudio={selectedStudio}
        subscriptionTier={subscriptionTier}
      />

      <RecentConversations
        activeConversationId={activeConversationId}
        conversations={conversations}
        error={conversationActionError ?? loadError}
        isLoading={isLoadingConversation}
        onDeleteConversation={setConversationToDelete}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onSelectConversation={handleSelectConversation}
      />

      <DeleteConversationModal
        conversation={conversationToDelete}
        onCancel={() => setConversationToDelete(null)}
        onDelete={handleConfirmDeleteConversation}
      />
    </>
  );
}

function RecentConversations({
  activeConversationId,
  conversations,
  error,
  isLoading,
  onDeleteConversation,
  onNewChat,
  onRenameConversation,
  onSelectConversation,
}: {
  activeConversationId: string | null;
  conversations: AssistantConversation[];
  error: string | null;
  isLoading: boolean;
  onDeleteConversation: (conversation: AssistantConversation) => void;
  onNewChat: () => void;
  onRenameConversation: (
    conversationId: string,
    title: string,
  ) => Promise<boolean>;
  onSelectConversation: (conversationId: string) => void;
}) {
  return (
    <section className="relative mt-8 rounded-[1.5rem] border border-white/10 bg-black/60 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">Recent Conversations</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            Continue where you left off.
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isLoading ? (
            <p className="text-sm text-gold-bright">Loading conversation...</p>
          ) : null}
          <button
            type="button"
            onClick={onNewChat}
            className="rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold-bright transition hover:bg-gold/20"
          >
            New Chat
          </button>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {conversations.length > 0 ? (
          conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;

            return (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                isActive={isActive}
                isLoading={isLoading}
                onDeleteConversation={onDeleteConversation}
                onRenameConversation={onRenameConversation}
                onSelectConversation={onSelectConversation}
              />
            );
          })
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted sm:col-span-2 xl:col-span-3">
            Your recent conversations will appear here after you send a prompt.
          </div>
        )}
      </div>
    </section>
  );
}

function ConversationCard({
  conversation,
  isActive,
  isLoading,
  onDeleteConversation,
  onRenameConversation,
  onSelectConversation,
}: {
  conversation: AssistantConversation;
  isActive: boolean;
  isLoading: boolean;
  onDeleteConversation: (conversation: AssistantConversation) => void;
  onRenameConversation: (
    conversationId: string,
    title: string,
  ) => Promise<boolean>;
  onSelectConversation: (conversationId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const [isSaving, setIsSaving] = useState(false);

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || isSaving) {
      return;
    }

    setIsSaving(true);
    const renamed = await onRenameConversation(conversation.id, title);
    setIsSaving(false);

    if (renamed) {
      setIsEditing(false);
    }
  }

  return (
    <article
      className={`rounded-3xl border p-4 transition ${
        isActive
          ? "border-gold/50 bg-gold/10"
          : "border-white/10 bg-white/[0.03] hover:border-gold/40 hover:bg-gold/10"
      }`}
    >
      {isEditing ? (
        <form onSubmit={handleRename} className="space-y-3">
          <label
            className="sr-only"
            htmlFor={`conversation-title-${conversation.id}`}
          >
            Conversation title
          </label>
          <input
            id={`conversation-title-${conversation.id}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!title.trim() || isSaving}
              className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle(conversation.title);
                setIsEditing(false);
              }}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onSelectConversation(conversation.id)}
            className="block w-full text-left focus:outline-none"
            aria-pressed={isActive}
            disabled={isLoading}
          >
            <span className="block truncate text-base font-semibold text-white">
              {conversation.title}
            </span>
            <span className="mt-3 block text-xs uppercase tracking-[0.2em] text-muted">
              Created
            </span>
            <time
              dateTime={conversation.created_at}
              className="mt-1 block text-sm text-white"
            >
              {formatDate(conversation.created_at)}
            </time>
            <span className="mt-3 block text-xs uppercase tracking-[0.2em] text-muted">
              Updated
            </span>
            <time
              dateTime={conversation.updated_at}
              className="mt-1 block text-sm text-gold-bright"
            >
              {formatDate(conversation.updated_at)}
            </time>
          </button>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted transition hover:border-gold/40 hover:text-white"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => onDeleteConversation(conversation)}
              className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-100 transition hover:bg-red-500/20"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}

function DeleteConversationModal({
  conversation,
  onCancel,
  onDelete,
}: {
  conversation: AssistantConversation | null;
  onCancel: () => void;
  onDelete: () => void;
}) {
  if (!conversation) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-panel p-6 shadow-2xl">
        <p className="text-sm text-muted">Delete conversation</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Delete this conversation permanently?
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          This will remove the conversation, all associated messages, and project
          links. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
