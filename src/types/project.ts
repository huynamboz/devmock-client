export interface ResourceField {
  id: string;
  name: string;
  type: string;
  fakerType: string | null;
}

export interface Resource {
  id: string;
  projectId: string;
  name?: string;
  type?: string;
  data?: unknown; // Legacy field, may be present in list response
  fields?: ResourceField[]; // Fields array from detail response
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
  fields?: Array<{
    name: string;
    type: string;
    fakerType?: string | null;
  }>;
}

export interface UpdateResourceRequest {
  name?: string;
  fields?: Array<{
    id?: string;
    name: string;
    type: string;
    fakerType?: string | null;
  }>;
}

