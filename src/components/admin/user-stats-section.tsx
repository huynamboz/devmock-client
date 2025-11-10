import {
  Users,
  Shield,
  ShieldCheck,
  Globe,
  Lock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react";

import { usersService, type UserStats } from "@/services/users.service";

interface UserStatsSectionProps {
  stats: UserStats | null;
  isLoading: boolean;
}

export function UserStatsSection({
  stats,
  isLoading,
}: UserStatsSectionProps) {
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
      title: "Total Users",
      value: stats.total,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Users",
      value: stats.byStatus.active,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
      subtitle: `${stats.byStatus.inactive} inactive`,
    },
    {
      title: "Admins",
      value: stats.byRole.ADMIN,
      icon: ShieldCheck,
      color: "text-warning",
      bgColor: "bg-warning/10",
      subtitle: `${stats.byRole.USER} regular users`,
    },
    {
      title: "Local Accounts",
      value: stats.byProvider.LOCAL,
      icon: Lock,
      color: "text-default-600",
      bgColor: "bg-default-100",
      subtitle: `${stats.byProvider.GOOGLE} Google accounts`,
    },
  ];

  return (
    <div className="mb-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Role Distribution */}
        <div className="bg-content1 border border-default-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Role Distribution</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-warning" />
                <span className="text-sm text-default-600">Admin</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-default-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.byRole.ADMIN / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-default-900 w-8 text-right">
                  {stats.byRole.ADMIN}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-default-500" />
                <span className="text-sm text-default-600">User</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-default-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.byRole.USER / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-default-900 w-8 text-right">
                  {stats.byRole.USER}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Provider Distribution */}
        <div className="bg-content1 border border-default-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Provider Distribution</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-default-600" />
                <span className="text-sm text-default-600">Local</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-default-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-default-600 rounded-full"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.byProvider.LOCAL / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-default-900 w-8 text-right">
                  {stats.byProvider.LOCAL}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-sm text-default-600">Google</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-default-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.byProvider.GOOGLE / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-default-900 w-8 text-right">
                  {stats.byProvider.GOOGLE}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Users Stats */}
      <div className="mt-4 bg-content1 border border-default-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">New Users</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-default-50 rounded-lg">
            <div className="rounded-full bg-primary/10 p-3">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-default-600">Today</p>
              <p className="text-xl font-bold text-default-900">
                {stats.newUsers.today}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-default-50 rounded-lg">
            <div className="rounded-full bg-primary/10 p-3">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-default-600">This Week</p>
              <p className="text-xl font-bold text-default-900">
                {stats.newUsers.thisWeek}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-default-50 rounded-lg">
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-default-600">This Month</p>
              <p className="text-xl font-bold text-default-900">
                {stats.newUsers.thisMonth}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

