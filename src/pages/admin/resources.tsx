import type { AdminResource } from "@/services/admin-resources.service";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  Database,
  Calendar,
  MoreVertical,
  Trash2,
  RefreshCw,
  Edit,
  Eye,
  Folder,
  User,
  Mail,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Select, SelectItem } from "@heroui/select";
import { addToast } from "@heroui/toast";
import { useNavigate } from "react-router-dom";

import { title } from "@/components/primitives";
import {
  adminResourcesService,
  type GetAdminResourcesParams,
  type ResourceStats,
} from "@/services/admin-resources.service";
import { ResourceStatsSection } from "@/components/admin/resource-stats-section";
import DefaultLayout from "@/layouts/default";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

const columns = [
  { key: "name", label: "Resource Name" },
  { key: "project", label: "Project" },
  { key: "owner", label: "Owner" },
  { key: "recordCount", label: "Records" },
  { key: "apiSettings", label: "API Methods" },
  { key: "createdAt", label: "Created At" },
  { key: "actions", label: "Actions" },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => {
    loadResources();
    loadStats();
  }, [page, projectFilter]);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      setError("");

      const params: GetAdminResourcesParams = {
        page,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(projectFilter !== "all" && { projectId: projectFilter }),
      };

      const response = await adminResourcesService.getAll(params);

      setResources(response.data || []);
      setTotal(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);

      // Extract unique projects for filter dropdown
      const uniqueProjects = Array.from(
        new Map(
          response.data
            ?.filter((r) => r.project)
            .map((r) => [r.project!.id, r.project!]) || [],
        ).values(),
      );
      setProjects(uniqueProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resources.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setIsStatsLoading(true);
      const data = await adminResourcesService.getStats();

      setStats(data);
    } catch (err) {
      // Silently fail stats loading
      // eslint-disable-next-line no-console
      console.error("Failed to load stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadResources();
  };

  const handleDeleteResource = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete resource "${name}"? This will permanently delete the resource and all its records. This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await adminResourcesService.delete(id);
      await loadResources();
      await loadStats();

      addToast({
        title: "Resource deleted successfully",
        description: `Resource "${name}" has been deleted.`,
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to delete resource",
        description:
          err instanceof Error ? err.message : "Could not delete resource.",
        color: "danger",
        variant: "flat",
      });
    }
  };

  const handleViewResource = (resourceId: string, projectId: string) => {
    navigate(`/projects/${projectId}?resourceId=${resourceId}`);
  };

  const handleEditResource = (resourceId: string, projectId: string) => {
    navigate(`/projects/${projectId}?resourceId=${resourceId}&edit=true`);
  };

  const getApiMethodsCount = (apiSettings?: AdminResource["apiSettings"]) => {
    if (!apiSettings) return 0;

    return Object.values(apiSettings).filter((method) => method?.enabled)
      .length;
  };

  return (
    <DefaultLayout>
      <BackgroundRippleEffect cellSize={50} />
      <div className="container relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={title({ size: "md" })}>Resource Management</h1>
            <p className="text-default-600 mt-2">
              Manage all resources in the system
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<RefreshCw className="h-4 w-4" />}
            onPress={() => {
              loadResources();
              loadStats();
            }}
          >
            Refresh
          </Button>
        </div>

        {/* Stats Section */}
        <ResourceStatsSection isLoading={isStatsLoading} stats={stats} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            className="flex-1"
            classNames={{
              inputWrapper: "border-default-200",
            }}
            placeholder="Search by resource name..."
            size="lg"
            startContent={<Search className="h-4 w-4 text-default-400" />}
            value={searchQuery}
            variant="bordered"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            onValueChange={setSearchQuery}
          />
          <Button color="primary" size="lg" onPress={handleSearch}>
            Search
          </Button>
          <Select
            className="w-full sm:w-64"
            label="Project"
            placeholder="All Projects"
            selectedKeys={projectFilter !== "all" ? [projectFilter] : []}
            size="lg"
            variant="bordered"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;

              setProjectFilter(selected || "all");
              setPage(1);
            }}
          >
            <SelectItem key="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id}>{project.name}</SelectItem>
            ))}
          </Select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Resources Table */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-default-600">Loading resources...</p>
            </div>
          </div>
        ) : !resources || resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="rounded-full bg-default-100 p-6 mb-4">
              <Database className="h-12 w-12 text-default-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No resources found</h2>
            <p className="text-default-600 mb-6 max-w-md">
              {searchQuery || projectFilter !== "all"
                ? "Try adjusting your filters to see more results."
                : "No resources have been created yet."}
            </p>
            {(searchQuery || projectFilter !== "all") && (
              <Button
                color="default"
                variant="bordered"
                onPress={() => {
                  setSearchQuery("");
                  setProjectFilter("all");
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-content1 border border-default-200 rounded-lg overflow-hidden">
              <Table
                isStriped
                removeWrapper
                aria-label="Resources table"
                classNames={{
                  wrapper: "min-h-[400px]",
                }}
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody emptyContent="No resources found">
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-primary" />
                          <span className="font-medium">{resource.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {resource.project ? (
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-default-400" />
                            <span>{resource.project.name}</span>
                          </div>
                        ) : (
                          <span className="text-default-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {resource.project?.owner ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-default-400" />
                              <span className="text-sm font-medium">
                                {resource.project.owner.name ||
                                  resource.project.owner.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-default-500">
                              <Mail className="h-3 w-3" />
                              <span>{resource.project.owner.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-default-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-default-100 text-default-600">
                          {resource.recordCount || 0} records
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {getApiMethodsCount(resource.apiSettings)} methods
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-default-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(resource.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Resource actions"
                            onAction={(key) => {
                              if (key === "delete") {
                                handleDeleteResource(
                                  resource.id,
                                  resource.name,
                                );
                              } else if (key === "view") {
                                handleViewResource(
                                  resource.id,
                                  resource.projectId,
                                );
                              } else if (key === "edit") {
                                handleEditResource(
                                  resource.id,
                                  resource.projectId,
                                );
                              }
                            }}
                          >
                            <DropdownItem
                              key="view"
                              startContent={<Eye className="h-4 w-4" />}
                            >
                              View
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              startContent={<Edit className="h-4 w-4" />}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Trash2 className="h-4 w-4" />}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-default-600">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} resources
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    color="default"
                    isDisabled={page === 1}
                    size="sm"
                    variant="bordered"
                    onPress={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-default-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    color="default"
                    isDisabled={page === totalPages}
                    size="sm"
                    variant="bordered"
                    onPress={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
}

