import {
  Database,
  FileText,
  Folder,
  TrendingUp,
  Loader2,
} from "lucide-react";

import { type ResourceStats } from "@/services/admin-resources.service";

interface ResourceStatsSectionProps {
  stats: ResourceStats | null;
  isLoading: boolean;
}

export function ResourceStatsSection({
  stats,
  isLoading,
}: ResourceStatsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-content1 border border-default-200 rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-default-200 rounded w-1/2 mb-4" />
            <div className="h-8 bg-default-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Resources",
      value: stats.total,
      icon: Database,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Resources with Records",
      value: stats.totalWithRecords,
      icon: FileText,
      color: "text-success",
      bgColor: "bg-success/10",
      subtitle: `${stats.total - stats.totalWithRecords} empty`,
    },
    {
      title: "Projects with Resources",
      value: stats.totalProjects,
      icon: Folder,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Avg Resources/Project",
      value: stats.averageResourcesPerProject.toFixed(1),
      icon: TrendingUp,
      color: "text-default-600",
      bgColor: "bg-default-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-content1 border border-default-200 rounded-lg p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`rounded-lg ${card.bgColor} p-3`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <div>
              <p className="text-sm text-default-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-default-900">
                {card.value}
              </p>
              {card.subtitle && (
                <p className="text-xs text-default-500 mt-1">
                  {card.subtitle}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

