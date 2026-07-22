import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Info,
  Send,
  ShieldAlert,
  Sparkles,
  UserRound,
  UsersRound,
  Map,
  TrendingUp,
} from "lucide-react";

import { askCrimeAssistant } from "../services/aiService";

const presets = [
  {
    text: "Show districts with the highest number of murder cases",
    icon: ShieldAlert,
    iconClass: "bg-red-500/15 text-red-400",
  },
  {
    text: "Find repeat offenders in Bengaluru",
    icon: UsersRound,
    iconClass: "bg-purple-500/15 text-purple-400",
  },
  {
    text: "Show FIRs registered under IPC Section 302",
    icon: Map,
    iconClass: "bg-blue-500/15 text-blue-400",
  },
  {
    text: "Compare robbery trends across Karnataka",
    icon: TrendingUp,
    iconClass: "bg-emerald-500/15 text-emerald-400",
  },
];

function AICrimeAssistant() {
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Hello! I am Kavach AI, your crime intelligence and investigation assistant.\n\nI can help you analyse FIR records, identify crime patterns, inspect repeat offenders and generate district-level insights.\n\nWhat would you like to investigate today?",
      time: "04:25 pm",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleSend = async (selectedQuestion) => {
    const finalQuestion =
      typeof selectedQuestion === "string"
        ? selectedQuestion.trim()
        : question.trim();

    if (!finalQuestion || isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: finalQuestion,
      time: getCurrentTime(),
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const result = await askCrimeAssistant(finalQuestion);

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.summary,
        sql: result.sql,
        rows: result.rows,
        count: result.count,
        time: getCurrentTime(),
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error(error);

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I could not process that request. Please try another crime intelligence query.",
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSend(question);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#020817]">
      {/* Page heading */}
      <header className="shrink-0 border-b border-slate-800 bg-[#051022] px-6 py-5 lg:px-8">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Sparkles className="text-blue-400" size={24} />

              <h1 className="text-xl font-bold text-white md:text-2xl">
                Kavach AI Copilot
              </h1>

              <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                Intelligence Preview
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              AI-powered crime investigation assistant and intelligence
              analysis engine
            </p>
          </div>
        </div>
      </header>

      {/* Main area */}
      <div className="min-h-0 flex-1 overflow-hidden p-4 lg:p-5">
        <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          {/* Presets */}
          <aside className="hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#071225] xl:flex">
            <div className="shrink-0 border-b border-slate-800 px-5 py-5">
              <div className="flex items-center gap-2">
                <Sparkles size={17} className="text-yellow-300" />

                <h2 className="text-sm font-bold uppercase tracking-wide text-white">
                  Investigation Presets
                </h2>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {presets.map(({ text, icon: Icon, iconClass }) => (
                  <button
                    key={text}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSend(text)}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-slate-700 bg-[#081426] p-4 text-left transition hover:border-blue-500/60 hover:bg-[#0c1b33] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                    >
                      <Icon size={20} />
                    </div>

                    <span className="text-sm font-medium leading-6 text-slate-100">
                      {text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-800 p-4">
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex items-start gap-3">
                  <Info
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-400"
                  />

                  <p className="text-xs leading-5 text-slate-300">
                    <span className="font-semibold text-blue-300">
                      Kavach AI Intelligence Preview
                    </span>
                    <br />
                    Results are generated from available FIR data and must be
                    verified with authorised police records.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Chat */}
          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#061124]">
            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-7">
              <div className="mx-auto flex max-w-5xl flex-col gap-7">
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="mt-7 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-500/60 bg-blue-500/10 text-blue-300">
                          <Bot size={21} />
                        </div>
                      )}

                      <div
                        className={`min-w-0 ${
                          isUser
                            ? "max-w-[82%] md:max-w-[65%]"
                            : "max-w-[88%] md:max-w-[78%]"
                        }`}
                      >
                        <div
                          className={`mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300 ${
                            isUser ? "justify-end" : ""
                          }`}
                        >
                          <span>
                            {isUser ? "Investigator" : "Kavach AI"}
                          </span>

                          <span className="text-slate-600">•</span>

                          <span>{message.time}</span>
                        </div>

                        <div
                          className={`rounded-2xl border px-5 py-4 ${
                            isUser
                              ? "rounded-tr-md border-blue-500 bg-blue-600 text-white"
                              : "rounded-tl-md border-slate-600 bg-[#1a2940] text-slate-100"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-7">
                            {message.content}
                          </p>

                          {message.sql && (
                            <details className="mt-4">
                              <summary className="cursor-pointer text-xs font-semibold text-blue-300">
                                View generated SQL
                              </summary>

                              <pre className="mt-3 max-w-full overflow-x-auto rounded-xl bg-[#030917] p-4 text-xs leading-6 text-emerald-400">
                                <code>{message.sql}</code>
                              </pre>
                            </details>
                          )}

                          {message.rows?.length > 0 && (
                            <div className="mt-4 max-w-full overflow-x-auto rounded-xl border border-slate-600">
                              <table className="min-w-full text-xs">
                                <thead className="bg-[#061124]">
                                  <tr>
                                    {Object.keys(message.rows[0]).map(
                                      (column) => (
                                        <th
                                          key={column}
                                          className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-200"
                                        >
                                          {column}
                                        </th>
                                      )
                                    )}
                                  </tr>
                                </thead>

                                <tbody>
                                  {message.rows.map((row, rowIndex) => (
                                    <tr
                                      key={rowIndex}
                                      className="border-t border-slate-700"
                                    >
                                      {Object.keys(message.rows[0]).map(
                                        (column) => (
                                          <td
                                            key={column}
                                            className="whitespace-nowrap px-4 py-3 text-slate-300"
                                          >
                                            {row[column] ?? "—"}
                                          </td>
                                        )
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>

                      {isUser && (
                        <div className="mt-7 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                          <UserRound size={18} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="mt-7 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-500/60 bg-blue-500/10 text-blue-300">
                      <Bot size={21} />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <span>Kavach AI</span>
                        <span className="text-slate-600">•</span>
                        <span>Analysing</span>
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-600 bg-[#1a2940] px-5 py-4">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />

                        <span className="ml-2 text-sm text-slate-300">
                          Analysing FIR records...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <footer className="shrink-0 border-t border-slate-700 bg-[#0a1629] p-4">
              <form
                onSubmit={handleSubmit}
                className="mx-auto flex max-w-5xl items-center gap-3"
              >
                <input
                  type="text"
                  value={question}
                  disabled={isLoading}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask Kavach AI about FIRs, offenders, crime trends or districts..."
                  className="h-13 min-w-0 flex-1 rounded-xl border border-slate-700 bg-[#061124] px-5 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={!question.trim() || isLoading}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={19} />
                </button>
              </form>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AICrimeAssistant;