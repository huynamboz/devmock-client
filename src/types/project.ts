export interface ResourceField {
  id: string;
  name: string;
  type: string;
  fakerType: string | null;
}

export interface Resource {
  id: string;
  projectId: string;
  name: string; // Required: Resource name (table/endpoint name)
  type?: string;
  data?: unknown; // Legacy field, may be present in list response
  fields?: ResourceField[]; // Fields array from detail response
  recordCount?: number; // Number of records in this resource
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  resources?: Resource[];
}

export interface CreateProjectRequest {
  name: string;
}

export interface CreateResourceRequest {
  name: string;
  mode?: "schema" | "template";
  fields?: Array<{
    name: string;
    type: string;
    fakerType?: string | null;
  }>;
  jsonTemplate?: string;
}

export interface UpdateResourceRequest {
  name?: string;
  fields?: Array<{
    name: string;
    type: string;
    fakerType?: string | null;
  }>;
  jsonTemplate?: string;
}
