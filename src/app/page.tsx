"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Home, Calendar, Bell, CheckCircle2, Circle, Trash2, Star, Clock, 
  Zap, BookOpen, TrendingUp, Settings, Timer, Lightbulb, BarChart3,
  Award, Target, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Priority = "alta" | "media" | "baixa";
type Frequency = "diaria" | "semanal" | "mensal";
type RoutineType = "em-casa" | "trabalho-fora" | "fim-de-semana";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  frequency: Frequency;
  room: string;
  createdAt: number;
  completedAt?: number;
  estimatedMinutes?: number;
  isQuickTask?: boolean; // Para modo 30 minutos
}

interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Routine {
  id: string;
  name: string;
  type: RoutineType;
  taskIds: string[];
  active: boolean;
}

interface Tip {
  id: string;
  title: string;
  category: string;
  content: string;
  icon: string;
}

const defaultRooms: Room[] = [
  { id: "cozinha", name: "Cozinha", icon: "🍳", color: "from-orange-400 to-red-500" },
  { id: "banheiro", name: "Banheiro", icon: "🚿", color: "from-blue-400 to-cyan-500" },
  { id: "sala", name: "Sala", icon: "🛋️", color: "from-purple-400 to-pink-500" },
  { id: "quarto", name: "Quarto", icon: "🛏️", color: "from-indigo-400 to-blue-500" },
  { id: "lavanderia", name: "Lavanderia", icon: "🧺", color: "from-teal-400 to-green-500" },
  { id: "geral", name: "Geral", icon: "🏠", color: "from-gray-400 to-slate-500" },
];

const organizationTips: Tip[] = [
  {
    id: "1",
    title: "Divisão de Tarefas em Família",
    category: "Organização",
    icon: "👨‍👩‍👧‍👦",
    content: "Envolva toda a família! Crianças podem arrumar brinquedos, adolescentes podem cuidar do próprio quarto, e adultos dividem as tarefas maiores. Isso cria responsabilidade e torna a limpeza mais rápida."
  },
  {
    id: "2",
    title: "Técnica dos 15 Minutos",
    category: "Produtividade",
    icon: "⏱️",
    content: "Dedique apenas 15 minutos por dia para uma tarefa específica. Você ficará surpresa com o quanto consegue fazer em pouco tempo quando está focada!"
  },
  {
    id: "3",
    title: "Cuidados com Produtos de Limpeza",
    category: "Segurança",
    icon: "🧴",
    content: "Nunca misture água sanitária com outros produtos! Mantenha produtos em locais altos, longe de crianças. Use luvas para proteger suas mãos e sempre ventile o ambiente."
  },
  {
    id: "4",
    title: "Método de Limpeza por Zonas",
    category: "Estratégia",
    icon: "🗺️",
    content: "Divida sua casa em zonas e limpe uma por dia. Segunda: cozinha, Terça: banheiros, Quarta: quartos, etc. Assim você mantém tudo limpo sem sobrecarregar um único dia."
  },
  {
    id: "5",
    title: "Lista de Compras Inteligente",
    category: "Planejamento",
    icon: "📝",
    content: "Mantenha uma lista de produtos de limpeza que estão acabando. Compre em quantidade quando houver promoção dos itens que você mais usa."
  },
  {
    id: "6",
    title: "Rotina Noturna de 10 Minutos",
    category: "Hábitos",
    icon: "🌙",
    content: "Antes de dormir: lave a louça, organize a sala, prepare a cozinha para o café da manhã. Acordar com a casa arrumada melhora seu humor!"
  }
];

export default function CasaLimpa() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rooms, setRooms] = useState<Room[]>(defaultRooms);
  const [selectedRoom, setSelectedRoom] = useState<string>("todos");
  const [selectedFrequency, setSelectedFrequency] = useState<Frequency | "todos">("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [activeTab, setActiveTab] = useState("tarefas");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineType | "todas">("todas");
  
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "media" as Priority,
    frequency: "diaria" as Frequency,
    room: "cozinha",
    estimatedMinutes: 10,
    isQuickTask: false,
  });

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("casalimpa-tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Add sample tasks with quick mode flag
      const sampleTasks: Task[] = [
        {
          id: "1",
          title: "Lavar louça",
          completed: false,
          priority: "alta",
          frequency: "diaria",
          room: "cozinha",
          createdAt: Date.now(),
          estimatedMinutes: 15,
          isQuickTask: true,
        },
        {
          id: "2",
          title: "Limpar pia do banheiro",
          completed: false,
          priority: "media",
          frequency: "diaria",
          room: "banheiro",
          createdAt: Date.now(),
          estimatedMinutes: 5,
          isQuickTask: true,
        },
        {
          id: "3",
          title: "Passar aspirador na sala",
          completed: false,
          priority: "media",
          frequency: "semanal",
          room: "sala",
          createdAt: Date.now(),
          estimatedMinutes: 20,
          isQuickTask: false,
        },
        {
          id: "4",
          title: "Organizar mesa de centro",
          completed: false,
          priority: "alta",
          frequency: "diaria",
          room: "sala",
          createdAt: Date.now(),
          estimatedMinutes: 5,
          isQuickTask: true,
        },
        {
          id: "5",
          title: "Arrumar cama",
          completed: false,
          priority: "alta",
          frequency: "diaria",
          room: "quarto",
          createdAt: Date.now(),
          estimatedMinutes: 3,
          isQuickTask: true,
        },
      ];
      setTasks(sampleTasks);
      localStorage.setItem("casalimpa-tasks", JSON.stringify(sampleTasks));
    }

    // Load routines
    const savedRoutines = localStorage.getItem("casalimpa-routines");
    if (savedRoutines) {
      setRoutines(JSON.parse(savedRoutines));
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("casalimpa-tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Save routines to localStorage
  useEffect(() => {
    if (routines.length > 0) {
      localStorage.setItem("casalimpa-routines", JSON.stringify(routines));
    }
  }, [routines]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Digite o nome da tarefa");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      completed: false,
      priority: newTask.priority,
      frequency: newTask.frequency,
      room: newTask.room,
      createdAt: Date.now(),
      estimatedMinutes: newTask.estimatedMinutes,
      isQuickTask: newTask.isQuickTask,
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      priority: "media",
      frequency: "diaria",
      room: "cozinha",
      estimatedMinutes: 10,
      isQuickTask: false,
    });
    setIsAddDialogOpen(false);
    toast.success("Tarefa adicionada!");
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const newCompleted = !task.completed;
          if (newCompleted) {
            toast.success("Tarefa concluída! 🎉");
            return { ...task, completed: newCompleted, completedAt: Date.now() };
          }
          return { ...task, completed: newCompleted, completedAt: undefined };
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast.success("Tarefa removida");
  };

  const activateQuickMode = () => {
    setQuickMode(true);
    setSelectedRoom("todos");
    setSelectedFrequency("todos");
    toast.success("🚀 Modo Rápido Ativado! Foque nas tarefas essenciais.", {
      duration: 3000,
    });
  };

  const deactivateQuickMode = () => {
    setQuickMode(false);
    toast.info("Modo normal restaurado");
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "alta":
        return "bg-red-500";
      case "media":
        return "bg-yellow-500";
      case "baixa":
        return "bg-green-500";
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case "alta":
        return "Alta";
      case "media":
        return "Média";
      case "baixa":
        return "Baixa";
    }
  };

  const getFrequencyLabel = (frequency: Frequency) => {
    switch (frequency) {
      case "diaria":
        return "Diária";
      case "semanal":
        return "Semanal";
      case "mensal":
        return "Mensal";
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      // Quick mode filter
      if (quickMode && !task.isQuickTask) return false;
      // Room filter
      if (selectedRoom !== "todos" && task.room !== selectedRoom) return false;
      // Frequency filter
      if (selectedFrequency !== "todos" && task.frequency !== selectedFrequency) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by priority (alta > media > baixa)
      const priorityOrder = { alta: 0, media: 1, baixa: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return b.createdAt - a.createdAt;
    });

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const totalCount = filteredTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalEstimatedTime = filteredTasks
    .filter(t => !t.completed)
    .reduce((acc, task) => acc + (task.estimatedMinutes || 0), 0);

  // Statistics
  const today = new Date().setHours(0, 0, 0, 0);
  const todayCompletedTasks = tasks.filter(
    t => t.completedAt && new Date(t.completedAt).setHours(0, 0, 0, 0) === today
  ).length;

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  
  const weekCompletedTasks = tasks.filter(
    t => t.completedAt && t.completedAt >= thisWeekStart.getTime()
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-xl">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  CasaLimpa
                </h1>
                <p className="text-sm text-gray-600">Transforme sua casa em um lar impecável</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome da Tarefa</label>
                    <Input
                      placeholder="Ex: Lavar louça"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && addTask()}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cômodo</label>
                    <Select value={newTask.room} onValueChange={(value) => setNewTask({ ...newTask, room: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.icon} {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frequência</label>
                    <Select
                      value={newTask.frequency}
                      onValueChange={(value) => setNewTask({ ...newTask, frequency: value as Frequency })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diaria">Diária</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prioridade</label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value as Priority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tempo Estimado (minutos)</label>
                    <Input
                      type="number"
                      min="1"
                      value={newTask.estimatedMinutes}
                      onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="quick-task"
                      checked={newTask.isQuickTask}
                      onCheckedChange={(checked) => setNewTask({ ...newTask, isQuickTask: checked })}
                    />
                    <Label htmlFor="quick-task" className="text-sm">
                      Incluir no Modo Rápido (30 min)
                    </Label>
                  </div>
                  <Button onClick={addTask} className="w-full bg-gradient-to-r from-pink-500 to-purple-600">
                    Adicionar Tarefa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="tarefas" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="dicas" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Dicas
            </TabsTrigger>
            <TabsTrigger value="estatisticas" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          {/* TAREFAS TAB */}
          <TabsContent value="tarefas" className="space-y-6 mt-6">
            {/* Quick Mode Banner */}
            {quickMode && (
              <Card className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6" />
                    <div>
                      <h3 className="font-semibold">Modo Casa Apresentável em 30 Minutos</h3>
                      <p className="text-sm text-white/90">
                        Foque nas tarefas essenciais! Tempo estimado: {totalEstimatedTime} min
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={deactivateQuickMode}
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    Desativar
                  </Button>
                </div>
              </Card>
            )}

            {/* Stats Card */}
            <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Progresso de Hoje</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {completedCount} de {totalCount} tarefas concluídas
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      {completionPercentage}%
                    </div>
                    <div className="text-xs text-gray-600">Completo</div>
                  </div>
                  {!quickMode && (
                    <Button
                      onClick={activateQuickMode}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Modo 30min
                    </Button>
                  )}
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </Card>

            {/* Filters */}
            {!quickMode && (
              <>
                <Tabs defaultValue="todos" className="mb-6" onValueChange={(value) => setSelectedRoom(value)}>
                  <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-white/80 backdrop-blur-sm">
                    <TabsTrigger value="todos" className="whitespace-nowrap">
                      🏠 Todos
                    </TabsTrigger>
                    {rooms.map((room) => (
                      <TabsTrigger key={room.id} value={room.id} className="whitespace-nowrap">
                        {room.icon} {room.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                {/* Frequency Filter */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedFrequency === "todos" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFrequency("todos")}
                    className={selectedFrequency === "todos" ? "bg-gradient-to-r from-pink-500 to-purple-600" : ""}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Todas
                  </Button>
                  <Button
                    variant={selectedFrequency === "diaria" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFrequency("diaria")}
                    className={selectedFrequency === "diaria" ? "bg-gradient-to-r from-pink-500 to-purple-600" : ""}
                  >
                    Diárias
                  </Button>
                  <Button
                    variant={selectedFrequency === "semanal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFrequency("semanal")}
                    className={selectedFrequency === "semanal" ? "bg-gradient-to-r from-pink-500 to-purple-600" : ""}
                  >
                    Semanais
                  </Button>
                  <Button
                    variant={selectedFrequency === "mensal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFrequency("mensal")}
                    className={selectedFrequency === "mensal" ? "bg-gradient-to-r from-pink-500 to-purple-600" : ""}
                  >
                    Mensais
                  </Button>
                </div>
              </>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <Card className="p-8 sm:p-12 text-center bg-white/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-full">
                      <CheckCircle2 className="w-12 h-12 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {quickMode ? "Nenhuma tarefa rápida encontrada" : "Nenhuma tarefa encontrada"}
                      </h3>
                      <p className="text-gray-600">
                        {quickMode
                          ? "Marque tarefas como 'Modo Rápido' ao criá-las!"
                          : "Adicione uma nova tarefa para começar!"}
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                filteredTasks.map((task) => {
                  const room = rooms.find((r) => r.id === task.room);
                  return (
                    <Card
                      key={task.id}
                      className={`p-4 bg-white/80 backdrop-blur-sm border-l-4 transition-all duration-300 hover:shadow-lg ${
                        task.completed ? "opacity-60" : ""
                      }`}
                      style={{ borderLeftColor: task.completed ? "#9ca3af" : getPriorityColor(task.priority) }}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3
                              className={`font-medium text-gray-900 ${
                                task.completed ? "line-through text-gray-500" : ""
                              }`}
                            >
                              {task.title}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {room?.icon} {room?.name}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {getFrequencyLabel(task.frequency)}
                              </Badge>
                              {task.estimatedMinutes && (
                                <Badge variant="outline" className="text-xs">
                                  <Timer className="w-3 h-3 mr-1" />
                                  {task.estimatedMinutes} min
                                </Badge>
                              )}
                              <Badge className={`text-xs ${getPriorityColor(task.priority)} text-white`}>
                                <Star className="w-3 h-3 mr-1" />
                                {getPriorityLabel(task.priority)}
                              </Badge>
                              {task.isQuickTask && (
                                <Badge className="text-xs bg-orange-500 text-white">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Rápida
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* DICAS TAB */}
          <TabsContent value="dicas" className="space-y-4 mt-6">
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6" />
                <h2 className="text-xl font-bold">Dicas de Organização</h2>
              </div>
              <p className="text-white/90">
                Aprenda técnicas profissionais para manter sua casa sempre organizada e limpa!
              </p>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {organizationTips.map((tip) => (
                <Card key={tip.id} className="p-6 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{tip.icon}</div>
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {tip.category}
                      </Badge>
                      <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{tip.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Video Tips Section */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Play className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Vídeos Recomendados</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Como organizar a cozinha em 15 minutos</p>
                    <p className="text-xs text-gray-600">Técnicas práticas e rápidas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Rotina de limpeza semanal eficiente</p>
                    <p className="text-xs text-gray-600">Planeje sua semana com inteligência</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Produtos de limpeza caseiros e econômicos</p>
                    <p className="text-xs text-gray-600">Receitas naturais e eficazes</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ESTATÍSTICAS TAB */}
          <TabsContent value="estatisticas" className="space-y-6 mt-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-0">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6" />
                <h2 className="text-xl font-bold">Seu Progresso</h2>
              </div>
              <p className="text-white/90">
                Acompanhe suas conquistas e mantenha-se motivada!
              </p>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{todayCompletedTasks}</p>
                    <p className="text-sm text-gray-600">Tarefas Hoje</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{weekCompletedTasks}</p>
                    <p className="text-sm text-gray-600">Tarefas esta Semana</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                    <p className="text-sm text-gray-600">Total de Tarefas</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Achievements */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Conquistas</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className={`p-4 rounded-lg border-2 ${todayCompletedTasks >= 5 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🌟</div>
                    <div>
                      <p className="font-medium text-gray-900">Produtiva do Dia</p>
                      <p className="text-xs text-gray-600">Complete 5 tarefas em um dia</p>
                      <p className="text-xs font-semibold text-purple-600 mt-1">
                        {todayCompletedTasks}/5 tarefas
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${weekCompletedTasks >= 20 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🏆</div>
                    <div>
                      <p className="font-medium text-gray-900">Rainha da Organização</p>
                      <p className="text-xs text-gray-600">Complete 20 tarefas em uma semana</p>
                      <p className="text-xs font-semibold text-purple-600 mt-1">
                        {weekCompletedTasks}/20 tarefas
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${tasks.filter(t => t.isQuickTask).length >= 5 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">⚡</div>
                    <div>
                      <p className="font-medium text-gray-900">Mestre do Modo Rápido</p>
                      <p className="text-xs text-gray-600">Crie 5 tarefas rápidas</p>
                      <p className="text-xs font-semibold text-purple-600 mt-1">
                        {tasks.filter(t => t.isQuickTask).length}/5 tarefas
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${tasks.filter(t => t.completed).length >= 50 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">💎</div>
                    <div>
                      <p className="font-medium text-gray-900">Veterana da Limpeza</p>
                      <p className="text-xs text-gray-600">Complete 50 tarefas no total</p>
                      <p className="text-xs font-semibold text-purple-600 mt-1">
                        {tasks.filter(t => t.completed).length}/50 tarefas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Motivational Quote */}
            <Card className="p-6 bg-gradient-to-br from-pink-100 to-purple-100 border-0">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  "Uma casa organizada é o reflexo de uma mente tranquila"
                </p>
                <p className="text-sm text-gray-600">
                  Continue assim! Cada tarefa concluída é uma vitória! 🎉
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
