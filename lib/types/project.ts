export type ProjectStage = "idea" | "mvp" | "launched" | "scaling";
export type ProjectSector =
  | "tech"
  | "consumer"
  | "b2b"
  | "ecommerce"
  | "media"
  | "other";
export type ProjectPriority = "strategy" | "tech" | "marketing" | "growth";
export type ProjectTimeCommitment = "parttime" | "fulltime" | "weekend";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  sector: ProjectSector | null;
  stage: ProjectStage;
  priority: ProjectPriority | null;
  time_commitment: ProjectTimeCommitment | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  sector?: ProjectSector;
  stage: ProjectStage;
  priority?: ProjectPriority;
  time_commitment?: ProjectTimeCommitment;
}