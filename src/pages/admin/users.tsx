import type { User } from "@/types/auth";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  User as UserIcon,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  MoreVertical,
  Trash2,
  RefreshCw,
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

import { title } from "@/components/primitives";
import {
  usersService,
  type GetUsersParams,
  type UserStats,
} from "@/services/users.service";
import { UserStatsSection } from "@/components/admin/user-stats-section";
import DefaultLayout from "@/layouts/default";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

const columns = [
  { key: "id", label: "ID" },
  { key: "email", label: "Email" },
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "provider", label: "Provider" },
  { key: "isActive", label: "Status" },
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [page, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const params: GetUsersParams = {
        page,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter !== "all" && { role: roleFilter as "USER" | "ADMIN" }),
        ...(statusFilter !== "all" && {
          isActive: statusFilter === "active",
        }),
      };

      const response = await usersService.getAll(params);

      setUsers(response.users || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setIsStatsLoading(true);
      const data = await usersService.getStats();

      setStats(data);
    } catch (err) {
      // Silently fail stats loading, don't show error to user
      // eslint-disable-next-line no-console
      console.error("Failed to load stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${email}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await usersService.delete(id);
      await loadUsers();

      addToast({
        title: "User deleted successfully",
        description: `User "${email}" has been deleted.`,
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to delete user",
        description:
          err instanceof Error ? err.message : "Could not delete user.",
        color: "danger",
        variant: "flat",
      });
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await usersService.update(user.id, {
        isActive: !user.isActive,
      });
      await loadUsers();

      addToast({
        title: "User updated successfully",
        description: `User "${user.email}" has been ${
          !user.isActive ? "activated" : "deactivated"
        }.`,
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to update user",
        description:
          err instanceof Error ? err.message : "Could not update user.",
        color: "danger",
        variant: "flat",
      });
    }
  };

  return (
    <DefaultLayout>
      <BackgroundRippleEffect cellSize={50} />
      <div className="container relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={title({ size: "md" })}>User Management</h1>
            <p className="text-default-600 mt-2">
              Manage all users in the system
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<RefreshCw className="h-4 w-4" />}
            onPress={() => {
              loadUsers();
              loadStats();
            }}
          >
            Refresh
          </Button>
        </div>

        {/* Stats Section */}
        <UserStatsSection isLoading={isStatsLoading} stats={stats} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            className="flex-1"
            classNames={{
              inputWrapper: "border-default-200",
            }}
            placeholder="Search by email or name..."
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
            className="w-full sm:w-48"
            label="Role"
            selectedKeys={[roleFilter]}
            size="lg"
            variant="bordered"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;

              setRoleFilter(selected);
              setPage(1);
            }}
          >
            <SelectItem key="all">All Roles</SelectItem>
            <SelectItem key="USER">User</SelectItem>
            <SelectItem key="ADMIN">Admin</SelectItem>
          </Select>
          <Select
            className="w-full sm:w-48"
            label="Status"
            selectedKeys={[statusFilter]}
            size="lg"
            variant="bordered"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;

              setStatusFilter(selected);
              setPage(1);
            }}
          >
            <SelectItem key="all">All Status</SelectItem>
            <SelectItem key="active">Active</SelectItem>
            <SelectItem key="inactive">Inactive</SelectItem>
          </Select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-default-600">Loading users...</p>
            </div>
          </div>
        ) : !users || users.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="rounded-full bg-default-100 p-6 mb-4">
              <UserIcon className="h-12 w-12 text-default-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No users found</h2>
            <p className="text-default-600 mb-6 max-w-md">
              {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters to see more results."
                : "No users have been created yet."}
            </p>
            {(searchQuery ||
              roleFilter !== "all" ||
              statusFilter !== "all") && (
              <Button
                color="default"
                variant="bordered"
                onPress={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setStatusFilter("all");
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
                aria-label="Users table"
                classNames={{
                  wrapper: "min-h-[400px]",
                }}
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody emptyContent="No users found">
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-default-400" />
                          <span>{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.name || (
                          <span className="text-default-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-primary/10 text-primary"
                              : "bg-default-100 text-default-600"
                          }`}
                        >
                          {user.role === "ADMIN" ? (
                            <ShieldCheck className="h-3 w-3" />
                          ) : (
                            <Shield className="h-3 w-3" />
                          )}
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-default-100 text-default-600">
                          {user.provider}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-success/10 text-success"
                              : "bg-default-100 text-default-600"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-default-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(user.createdAt)}</span>
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
                            aria-label="User actions"
                            onAction={(key) => {
                              if (key === "delete") {
                                handleDeleteUser(user.id, user.email);
                              } else if (key === "toggle-active") {
                                handleToggleActive(user);
                              }
                            }}
                          >
                            <DropdownItem
                              key="toggle-active"
                              startContent={
                                user.isActive ? (
                                  <Shield className="h-4 w-4" />
                                ) : (
                                  <ShieldCheck className="h-4 w-4" />
                                )
                              }
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
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
                  {Math.min(page * limit, total)} of {total} users
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
