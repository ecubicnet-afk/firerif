"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  sortOrder: number;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    try {
      await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          dueDate: newDueDate || null,
        }),
      });
      setNewTitle("");
      setNewDueDate("");
      fetchTodos();
    } catch {
      alert("追加に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function toggleComplete(todo: Todo) {
    await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    fetchTodos();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  }

  const incomplete = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ToDoリスト</h1>
        <p className="text-muted-foreground mt-1">
          FIREに向けてやるべきことを管理しましょう
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder="新しいタスクを入力..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-40"
            />
            <Button type="submit" disabled={loading || !newTitle.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {incomplete.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            未完了 ({incomplete.length})
          </h2>
          {incomplete.map((todo) => (
            <Card key={todo.id}>
              <CardContent className="flex items-center gap-3 p-3">
                <button onClick={() => toggleComplete(todo)}>
                  <Square className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{todo.title}</p>
                  {todo.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      期限: {new Date(todo.dueDate).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(todo.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            完了済み ({completed.length})
          </h2>
          {completed.map((todo) => (
            <Card key={todo.id} className="opacity-60">
              <CardContent className="flex items-center gap-3 p-3">
                <button onClick={() => toggleComplete(todo)}>
                  <CheckSquare className="h-5 w-5 text-primary" />
                </button>
                <p className="text-sm line-through flex-1">{todo.title}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(todo.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {todos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 gap-3">
            <CheckSquare className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              タスクを追加して、FIREへの道を一歩ずつ進みましょう
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
