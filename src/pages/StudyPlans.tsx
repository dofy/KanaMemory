import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
} from "lucide-react";
import { loadStudyPlans } from "@/lib/study-plan-loader";
import { ProgressService } from "@/lib/progress-service";
import type { StudyPlanDefinition, StudyPlan } from "@/lib/db-types";
import { toast } from "sonner";

const DIFFICULTY_COLORS = {
  beginner: "bg-green-500",
  intermediate: "bg-yellow-500",
  advanced: "bg-red-500",
};

const DIFFICULTY_NAMES = {
  beginner: "入門",
  intermediate: "進階",
  advanced: "高級",
};

export default function StudyPlansPage() {
  const [mounted, setMounted] = useState(false);
  const [planDefinitions, setPlanDefinitions] = useState<StudyPlanDefinition[]>([]);
  const [activePlans, setActivePlans] = useState<StudyPlan[]>([]);
  const [completedPlans, setCompletedPlans] = useState<StudyPlan[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    const [definitions, active, completed] = await Promise.all([
      loadStudyPlans(),
      ProgressService.getActivePlans(),
      ProgressService.getCompletedPlans(),
    ]);
    setPlanDefinitions(definitions);
    setActivePlans(active);
    setCompletedPlans(completed);
  };

  const handleStartPlan = async (definition: StudyPlanDefinition) => {
    const existingActive = activePlans.find((p) => p.planId === definition.id);
    if (existingActive) {
      toast.info("該方案已在進行中");
      return;
    }

    await ProgressService.startPlan(definition);
    toast.success(`已開始「${definition.name}」學習方案`);
    await loadData();
  };

  const getActivePlan = (definitionId: string) => {
    return activePlans.find((p) => p.planId === definitionId);
  };

  const getCompletedCount = (definitionId: string) => {
    return completedPlans.filter((p) => p.planId === definitionId).length;
  };

  const calculateProgress = (plan: StudyPlan) => {
    const completed = plan.stages.filter((s) => s.completed).length;
    return Math.round((completed / plan.stages.length) * 100);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation showBackButton />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">學習方案</h2>
          <p className="text-muted-foreground">
            選擇適合你的學習計劃，系統化地提升日語能力
          </p>
        </div>

        {/* Active Plans */}
        {activePlans.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5" />
              進行中的方案
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePlans.map((plan) => (
                <Card key={plan.id} className="border-primary/50 transition-all hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <Badge variant="outline" className="text-primary">
                        進行中
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>
                            階段 {plan.currentStage + 1} / {plan.stages.length}
                          </span>
                          <span>{calculateProgress(plan)}%</span>
                        </div>
                        <Progress value={calculateProgress(plan)} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        當前：{plan.stages[plan.currentStage]?.name || "已完成"}
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/study-plans/${plan.id}/learn`)}
                      >
                        繼續學習
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Plans */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            可選方案
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planDefinitions.map((definition) => {
              const activePlan = getActivePlan(definition.id);
              const completedCount = getCompletedCount(definition.id);

              return (
                <Card key={definition.id} className="flex flex-col transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        className={`${DIFFICULTY_COLORS[definition.difficulty]} text-white`}
                      >
                        {DIFFICULTY_NAMES[definition.difficulty]}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {definition.estimatedDays}天
                      </div>
                    </div>
                    <CardTitle>{definition.name}</CardTitle>
                    <CardDescription>{definition.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        共 {definition.stages.length} 個階段
                      </p>
                      <ul className="text-sm space-y-1 mb-4">
                        {definition.stages.slice(0, 3).map((stage) => (
                          <li key={stage.id} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {stage.name}
                          </li>
                        ))}
                        {definition.stages.length > 3 && (
                          <li className="text-muted-foreground">
                            ...還有 {definition.stages.length - 3} 個階段
                          </li>
                        )}
                      </ul>
                    </div>

                    {completedCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-green-600 mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        已完成 {completedCount} 次
                      </div>
                    )}

                    {activePlan ? (
                      <Button variant="outline" className="w-full" disabled>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        已在進行中
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleStartPlan(definition)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        開始方案
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
