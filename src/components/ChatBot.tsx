import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  FileDown,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api-client";
import * as XLSX from "xlsx";

interface TableData {
  columns: string[];
  rows: Record<string, unknown>[];
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
  tableData?: TableData;
}

const WELCOME_MESSAGE: Message = {
  id: 0,
  text: "Merhaba! Dogal dilde sorgunuzu yazin, size PDF veya Excel rapor olusturayim.",
  sender: "bot",
  timestamp: new Date(),
};

type ExportFormat = "pdf" | "excel";

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [previewData, setPreviewData] = useState<TableData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const parseExcelBlob = async (blob: Blob): Promise<TableData | null> => {
    try {
      const buffer = await blob.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      if (json.length === 0) return null;
      const columns = Object.keys(json[0]);
      return { columns, rows: json };
    } catch {
      return null;
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const xUser = JSON.stringify({
        role: user?.roles?.[0] ?? "",
        email: user?.email ?? "",
        fullName: user?.fullName ?? "",
      });

      const response = await apiClient.post(
        "ai/query",
        { message: text, format },
        {
          responseType: "blob",
          headers: { "x-user": xUser },
        },
      );

      const blob = new Blob([response.data]);
      const fileUrl = URL.createObjectURL(blob);
      const ext = format === "pdf" ? "pdf" : "xlsx";
      const fileName = `rapor.${ext}`;

      let tableData: TableData | undefined;
      if (format === "excel") {
        const parsed = await parseExcelBlob(blob);
        if (parsed) tableData = parsed;
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        text: "Raporunuz hazir!",
        sender: "bot",
        timestamp: new Date(),
        fileUrl,
        fileName,
        tableData,
      };
      setMessages((prev) => [...prev, botMsg]);

      if (tableData) {
        setPreviewData(tableData);
      }
    } catch (err: unknown) {
      let errorText = "Sorgu islenirken bir hata olustu.";

      if (err && typeof err === "object" && "response" in err) {
        const response = (
          err as { response: { data: Blob; status: number } }
        ).response;
        if (response?.data instanceof Blob) {
          try {
            const text = await response.data.text();
            const json = JSON.parse(text);
            errorText = json.detail || errorText;
          } catch {
            // blob parse basarisiz
          }
        }
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        text: errorText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Data Preview Overlay */}
      {previewData && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-float w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Sorgu Sonucu ({previewData.rows.length} satir)
                </span>
              </div>
              <button
                onClick={() => setPreviewData(null)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-secondary">
                  <tr>
                    {previewData.columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {previewData.rows.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-secondary/50 transition-colors"
                    >
                      {previewData.columns.map((col) => (
                        <td
                          key={col}
                          className="px-4 py-2 text-foreground whitespace-nowrap"
                        >
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] bg-card border border-border/50 rounded-2xl shadow-float flex flex-col animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-primary/5">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                AI Rapor Asistani
              </p>
              <p className="text-xs text-muted-foreground">Cevrimici</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === "bot"
                      ? "bg-primary/10 text-primary"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  {msg.sender === "bot" ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                    msg.sender === "bot"
                      ? "bg-secondary text-foreground rounded-bl-none"
                      : "bg-primary text-primary-foreground rounded-br-none"
                  }`}
                >
                  <p>{msg.text}</p>
                  {(msg.fileUrl || msg.tableData) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.fileUrl && (
                        <a
                          href={msg.fileUrl}
                          download={msg.fileName}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          Indir
                        </a>
                      )}
                      {msg.tableData && (
                        <button
                          onClick={() => setPreviewData(msg.tableData!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                          <Table className="w-3.5 h-3.5" />
                          Goruntule
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-secondary px-4 py-2 rounded-xl rounded-bl-none">
                  <span className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/50 space-y-2">
            {/* Format Toggle */}
            <div className="flex gap-1">
              <button
                onClick={() => setFormat("excel")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  format === "excel"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Excel
              </button>
              <button
                onClick={() => setFormat("pdf")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  format === "pdf"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                PDF
              </button>
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Sorgunuzu yazin..."
                className="flex-1 h-10 bg-secondary/50 border-border/50"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
