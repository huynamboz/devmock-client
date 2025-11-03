import { useEffect, useState } from "react";
import {
  Copy,
  Database,
  FileJson,
  Loader2,
  Table as TableIcon,
} from "lucide-react";
import { JsonEditor } from "json-edit-react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Tabs, Tab } from "@heroui/tabs";
import { addToast } from "@heroui/toast";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";

import { recordsService } from "@/services/records.service";

interface ViewDataModalProps {
  isOpen: boolean;
  projectId: string;
  resourceName: string;
  onClose: () => void;
}

export function ViewDataModal({
  isOpen,
  projectId,
  resourceName,
  onClose,
}: ViewDataModalProps) {
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && projectId && resourceName) {
      loadRecords();
    } else {
      // Reset when modal closes
      setRecords([]);
      setError("");
    }
  }, [isOpen, projectId, resourceName]);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await recordsService.getAll(projectId, resourceName);

      setRecords(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load records. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get all unique keys from records
  const getColumns = () => {
    if (records.length === 0) {
      return [];
    }

    const allKeys = new Set<string>();

    records.forEach((record) => {
      Object.keys(record).forEach((key) => allKeys.add(key));
    });

    return Array.from(allKeys).sort();
  };

  const columns = getColumns();

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="5xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">View Records</h2>
          </div>
          <p className="text-sm text-default-600 font-normal">
            Records for &quot;{resourceName}&quot; resource
          </p>
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-default-600">Loading records...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-default-100 p-6 mb-4">
                <Database className="h-12 w-12 text-default-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No records yet</h3>
              <p className="text-default-600 max-w-md text-sm">
                Generate some records using the slider or create them manually.
              </p>
            </div>
          ) : (
            <Tabs
              aria-label="View options"
              className="flex-1"
              defaultSelectedKey="json"
            >
              <Tab
                key="json"
                className="flex-1"
                title={
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    <span>JSON</span>
                  </div>
                }
              >
                <div className="relative flex-1 mt-4">
                  <div className="overflow-auto rounded-lg border border-default-200 bg-default-50 p-4">
                    <JsonEditor
                      className="w-full !max-w-full"
                      data={records}
                      rootName=""
                      showCollectionCount="when-closed"
                    />
                  </div>
                  <Button
                    isIconOnly
                    className="absolute top-2 right-2 z-10"
                    color="primary"
                    size="sm"
                    variant="flat"
                    onPress={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          JSON.stringify(records, null, 2),
                        );

                        addToast({
                          title: "Copied to clipboard",
                          description: "JSON data has been copied.",
                          color: "success",
                          variant: "flat",
                        });
                      } catch {
                        addToast({
                          title: "Failed to copy",
                          description: "Could not copy to clipboard.",
                          color: "danger",
                          variant: "flat",
                        });
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </Tab>
              <Tab
                key="table"
                title={
                  <div className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4" />
                    <span>Table</span>
                  </div>
                }
              >
                <div className="overflow-x-auto mt-4">
                  <Table
                    isStriped
                    removeWrapper
                    aria-label={`Records table for ${resourceName}`}
                    classNames={{
                      wrapper: "min-h-[222px]",
                    }}
                  >
                    <TableHeader>
                      {columns.map((column) => (
                        <TableColumn key={column}>{column}</TableColumn>
                      ))}
                    </TableHeader>
                    <TableBody emptyContent="No records found">
                      {records.map((record) => (
                        <TableRow key={record.id as string}>
                          {columns.map((column) => (
                            <TableCell key={column}>
                              <div
                                className="max-w-[300px] truncate"
                                title={formatValue(record[column])}
                              >
                                {formatValue(record[column])}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Tab>
            </Tabs>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Close
          </Button>
          {!isLoading && records.length > 0 && (
            <Button color="primary" onPress={loadRecords}>
              Refresh
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
