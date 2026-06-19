"use client";

import { useState } from "react";
import {
  loadAssistantConversation,
  loadAssistantProject,
} from "@/app/actions/assistant";
import { AssistantPrompt } from "@/app/dashboard/assistant-prompt";
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
  const [messages, setMessages] = useState(initialMessages);
  const [projects, setProjects] = useState(initialProjects);
  const [selectedModel, setSelectedModel] = useState(initialSelectedModel);
  const [selectedStudio, setSelectedStudio] =
    useState<AssistantStudioId>(defaultAssistantStudioId);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
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

  function handleProjectCreated(project: AssistantProject) {
    setProjects((currentProjects) => [
      project,
      ...currentProjects.filter((item) => item.id !== project.id),
    ]);
    setActiveProjectId(project.id);
    setActiveConversationId(null);
    setConversations([]);
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
        error={loadError}
        isLoading={isLoadingConversation}
        onSelectConversation={handleSelectConversation}
      />
    </>
  );
}

function RecentConversations({
  activeConversationId,
  conversations,
  error,
  isLoading,
  onSelectConversation,
}: {
  activeConversationId: string | null;
  conversations: AssistantConversation[];
  error: string | null;
  isLoading: boolean;
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
        {isLoading ? (
          <p className="text-sm text-gold-bright">Loading conversation...</p>
        ) : null}
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
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className={`rounded-3xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-gold/70 focus:ring-offset-2 focus:ring-offset-black ${
                  isActive
                    ? "border-gold/50 bg-gold/10"
                    : "border-white/10 bg-white/[0.03] hover:border-gold/40 hover:bg-gold/10"
                }`}
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
