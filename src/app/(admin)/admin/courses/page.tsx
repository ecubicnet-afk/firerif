"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Video } from "lucide-react";

interface Episode {
  id: string;
  title: string;
  sortOrder: number;
  duration?: number | null;
  description?: string | null;
  body?: string | null;
  videoUrl?: string;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  episodes: Episode[];
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showEpisodeForm, setShowEpisodeForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Course form
  const [courseSlug, setCourseSlug] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");

  // Episode form (create)
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeVideoUrl, setEpisodeVideoUrl] = useState("");
  const [episodeDescription, setEpisodeDescription] = useState("");
  const [episodeBody, setEpisodeBody] = useState("");

  // Episode edit
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBody, setEditBody] = useState("");

  const fetchCourses = useCallback(async () => {
    const res = await fetch("/api/admin/courses");
    if (res.ok) {
      setCourses(await res.json());
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: courseSlug,
          title: courseTitle,
          description: courseDescription || null,
        }),
      });
      setCourseSlug("");
      setCourseTitle("");
      setCourseDescription("");
      setShowCourseForm(false);
      fetchCourses();
    } catch {
      alert("作成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEpisode(e: React.FormEvent, courseId: string) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: episodeTitle,
          videoUrl: episodeVideoUrl,
          description: episodeDescription || null,
          body: episodeBody || null,
        }),
      });
      setEpisodeTitle("");
      setEpisodeVideoUrl("");
      setEpisodeDescription("");
      setEpisodeBody("");
      setShowEpisodeForm(null);
      fetchCourses();
    } catch {
      alert("作成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function startEditEpisode(ep: Episode) {
    setEditingEpisodeId(ep.id);
    setEditTitle(ep.title);
    setEditVideoUrl(ep.videoUrl || "");
    setEditDescription(ep.description || "");
    setEditBody(ep.body || "");
  }

  async function handleUpdateEpisode(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEpisodeId) return;
    setLoading(true);
    try {
      await fetch("/api/admin/episodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingEpisodeId,
          title: editTitle,
          videoUrl: editVideoUrl,
          description: editDescription || null,
          body: editBody || null,
        }),
      });
      setEditingEpisodeId(null);
      fetchCourses();
    } catch {
      alert("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary stats */}
      {courses.length > 0 && (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
          <span className="text-sm">
            <span className="font-medium">{courses.length}</span> コース
          </span>
          <span className="text-sm">
            <span className="font-medium">
              {courses.reduce((sum, c) => sum + c.episodes.length, 0)}
            </span> エピソード
          </span>
          <span className="text-sm">
            合計{" "}
            <span className="font-medium">
              {(() => {
                const totalMin = courses.reduce(
                  (sum, c) =>
                    sum +
                    c.episodes.reduce(
                      (eSum, e) => eSum + (e.duration || 0),
                      0
                    ),
                  0
                );
                if (totalMin === 0) return "—";
                const hours = Math.floor(totalMin / 60);
                const mins = totalMin % 60;
                return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
              })()}
            </span>
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">コース管理</h1>
        <Button onClick={() => setShowCourseForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          新規コース
        </Button>
      </div>

      {showCourseForm && (
        <Card>
          <CardHeader>
            <CardTitle>新しいコース</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>スラッグ（URL用）</Label>
                  <Input
                    placeholder="nisa-guide"
                    value={courseSlug}
                    onChange={(e) => setCourseSlug(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>タイトル</Label>
                  <Input
                    placeholder="NISAの始め方"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>説明</Label>
                <Textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>保存</Button>
                <Button type="button" variant="outline" onClick={() => setShowCourseForm(false)}>
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <CardTitle>{course.title}</CardTitle>
                <Badge variant="outline">{course.slug}</Badge>
                <Badge variant="secondary">
                  {course.episodes.length}話
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEpisodeForm(course.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                エピソード追加
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {showEpisodeForm === course.id && (
              <form
                onSubmit={(e) => handleCreateEpisode(e, course.id)}
                className="space-y-4 border rounded-lg p-4 mb-4"
              >
                <div className="space-y-2">
                  <Label>エピソードタイトル</Label>
                  <Input
                    value={episodeTitle}
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>動画URL（YouTube）</Label>
                  <Input
                    value={episodeVideoUrl}
                    onChange={(e) => setEpisodeVideoUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>説明（一覧・動画上に出る短い概要）</Label>
                  <Textarea
                    value={episodeDescription}
                    onChange={(e) => setEpisodeDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>補足・よくある質問・リンク（動画の下に表示・Markdown可）</Label>
                  <Textarea
                    rows={8}
                    placeholder={"## この動画で使った資料\n- [家計簿テンプレDL](https://...)\n\n## よくある質問\n**Q. iDeCoとNISAどっちが先？**\nA. まずは...\n"}
                    value={episodeBody}
                    onChange={(e) => setEpisodeBody(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    見出しは <code>## タイトル</code>、リンクは <code>[表示文字](URL)</code>、箇条書きは <code>- 項目</code> で書けます。
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>追加</Button>
                  <Button type="button" variant="outline" onClick={() => setShowEpisodeForm(null)}>
                    キャンセル
                  </Button>
                </div>
              </form>
            )}
            {course.episodes.map((ep, i) => (
              <div key={ep.id}>
                {editingEpisodeId === ep.id ? (
                  <form
                    onSubmit={handleUpdateEpisode}
                    className="space-y-4 border rounded-lg p-4 mb-2"
                  >
                    <div className="space-y-2">
                      <Label>エピソードタイトル</Label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>動画URL</Label>
                      <Input
                        value={editVideoUrl}
                        onChange={(e) => setEditVideoUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>説明（一覧・動画上に出る短い概要）</Label>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>補足・よくある質問・リンク（動画の下に表示・Markdown可）</Label>
                      <Textarea
                        rows={8}
                        placeholder={"## この動画で使った資料\n- [家計簿テンプレDL](https://...)\n\n## よくある質問\n**Q. iDeCoとNISAどっちが先？**\nA. まずは...\n"}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        見出しは <code>## タイトル</code>、リンクは <code>[表示文字](URL)</code>、箇条書きは <code>- 項目</code> で書けます。
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading}>保存</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingEpisodeId(null)}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditEpisode(ep)}
                    className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 w-full text-left"
                  >
                    <span className="text-sm text-muted-foreground w-8">
                      #{i + 1}
                    </span>
                    <span className="text-sm">{ep.title}</span>
                    {ep.body && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        補足あり
                      </Badge>
                    )}
                  </button>
                )}
              </div>
            ))}
            {course.episodes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                エピソードはまだありません
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
