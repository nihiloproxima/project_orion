"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Eye,
  Sword,
  Rocket,
  Trash2,
  MessageSquare,
  Bell,
  Bot,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BaseMail, MailType } from "@/models/mail";
import { generateTestMails } from "@/lib/test-data/mail";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ReportContent } from "@/components/ReportContent";

type FilterCategory = "all" | MailType;

const MAIL_CATEGORIES = [
  { type: "all", icon: Mail, label: "All Messages" },
  { type: "spy", icon: Eye, label: "Spy Reports" },
  { type: "combat", icon: Sword, label: "Combat Reports" },
  { type: "mission", icon: Rocket, label: "Mission Reports" },
  { type: "private_message", icon: MessageSquare, label: "Private Messages" },
  { type: "game_message", icon: Bell, label: "Game Messages" },
  { type: "ai_message", icon: Bot, label: "AI Messages" },
] as const;

export default function Reports() {
  const { state } = useGame();
  const [reports, setReports] = useState<BaseMail[]>([]);
  const [selectedReport, setSelectedReport] = useState<BaseMail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [isViewingMail, setIsViewingMail] = useState(false);

  useEffect(() => {
    const fetchMails = async () => {
      const testData = generateTestMails(state.currentUser?.id || "test-user");
      setReports(testData);
      setLoading(false);
    };

    fetchMails();

    const subscription = supabase
      .channel("mails")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mails",
          filter: `owner_id=eq.${state.currentUser?.id}`,
        },
        () => {
          // Comment out the real-time updates for now
          /* if (payload.eventType === "INSERT") {
            setReports((current) => [payload.new as BaseMail, ...current]);
          } else if (payload.eventType === "DELETE") {
            setReports((current) =>
              current.filter((r) => r.id !== payload.old.id)
            );
          } else if (payload.eventType === "UPDATE") {
            setReports((current) =>
              current.map((r) => (r.id === payload.new.id ? payload.new : r))
            );
          } */
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [state.currentUser?.id]);

  const getReportIcon = (type: string) => {
    const category = MAIL_CATEGORIES.find((cat) => cat.type === type);
    return category ? (
      <category.icon className="h-4 w-4" />
    ) : (
      <Mail className="h-4 w-4" />
    );
  };

  const deleteReport = async (id: string) => {
    try {
      await supabase.from("reports").delete().eq("id", id);
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase.from("reports").update({ read: true }).eq("id", id);
      setReports((current) =>
        current.map((r) => (r.id === id ? { ...r, read: true } : r))
      );
    } catch (error) {
      console.error("Error marking report as read:", error);
    }
  };

  const filteredReports = reports.filter(
    (report) => activeCategory === "all" || report.type === activeCategory
  );

  const getUnreadCount = (category: FilterCategory) => {
    return reports.filter(
      (r) => !r.read && (category === "all" || r.type === category)
    ).length;
  };

  if (loading) {
    return <LoadingScreen message="LOADING REPORTS..." />;
  }

  return (
    <div className="space-y-6">
      <Card className="border border-primary h-[calc(100vh-12rem)] shadow-2xl shadow-primary/20 overflow-hidden">
        <CardHeader className="border-b bg-gray-900 sticky top-0 z-10">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="text-primary font-mono">
              Secure Communications Terminal
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-4rem)] bg-gray-900/95 relative">
          <div className="grid grid-cols-[250px_1fr] absolute inset-0">
            <div className="border-r border-primary/20 p-4 space-y-4 bg-gray-900 overflow-y-auto">
              <div className="space-y-2">
                {MAIL_CATEGORIES.map((category) => (
                  <Button
                    key={category.type}
                    variant={
                      activeCategory === category.type ? "default" : "ghost"
                    }
                    className="w-full justify-start gap-2 h-12"
                    onClick={() => {
                      setActiveCategory(category.type);
                      setIsViewingMail(false);
                    }}
                  >
                    <category.icon className="h-4 w-4" />
                    <span>{category.label}</span>
                    {getUnreadCount(category.type) > 0 && (
                      <span className="ml-auto bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs">
                        {getUnreadCount(category.type)}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col h-full overflow-y-auto">
              {!isViewingMail ? (
                <div className="flex-1 p-4">
                  <div className="space-y-2">
                    {filteredReports.map((mail) => (
                      <div
                        key={mail.id}
                        className={`p-3 border border-primary/30 rounded-md cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:bg-gray-800 hover:border-primary ${
                          !mail.read ? "border-l-4 border-l-yellow-500" : ""
                        }`}
                        onClick={() => {
                          setSelectedReport(mail);
                          setIsViewingMail(true);
                          if (!mail.read) {
                            markAsRead(mail.id);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getReportIcon(mail.type)}
                            <div className="flex flex-col">
                              <span className="font-medium text-blue-400">
                                {mail.title}
                              </span>
                              <span className="text-xs text-gray-400">
                                From: {mail.sender_name}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteReport(mail.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-primary/60 mt-1">
                          {new Date(mail.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-6">
                  <div className="mb-4 sticky top-0 bg-gray-900 z-10 py-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsViewingMail(false)}
                      className="gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Back to Inbox
                    </Button>
                  </div>
                  {selectedReport && (
                    <ReportContent report={selectedReport as any} />
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
