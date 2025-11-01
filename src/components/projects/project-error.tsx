import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";

interface ProjectErrorProps {
  error: string;
}

export function ProjectError({ error }: ProjectErrorProps) {
  const navigate = useNavigate();

  return (
    <div className="background-grid flex-grow">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        <Button
          className="mb-6"
          color="primary"
          size="sm"
          startContent={<ArrowLeft size={16} />}
          variant="flat"
          onPress={() => navigate("/projects")}
        >
          Back to Projects
        </Button>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="rounded-full bg-danger/10 p-6 mb-4">
            <AlertCircle className="h-12 w-12 text-danger" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-default-600 mb-6 max-w-md">{error}</p>
          <Button
            color="primary"
            size="lg"
            startContent={<ArrowLeft size={20} />}
            onPress={() => navigate("/projects")}
          >
            Back to Projects
          </Button>
        </div>
      </div>
    </div>
  );
}

