import { io, Socket } from "socket.io-client";
import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import { getProjectQueryKey } from "@/shared/api";
import { Project } from "@/pages/projects/ui/project";

const ProjectSocketContext = createContext({} as Socket);

function ProjectSocketProvider({ children }: { children: ReactNode }) {
  const { project_id } = useParams<{ project_id: string }>();

  const socket = io(`${import.meta.env.VITE_BASE_API_URL}/projects`, {
    autoConnect: true,
    query: {
      project_id,
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on("project_invalidation", () => {
      queryClient
        .invalidateQueries({
          queryKey: getProjectQueryKey({
            project_id: project_id as string,
          }),
        })
        .then();
    });
  }, []);

  return (
    <ProjectSocketContext.Provider value={socket}>
      {children}
    </ProjectSocketContext.Provider>
  );
}

const useProjectSocket = () => {
  return useContext(ProjectSocketContext);
};

function ProjectWrapper() {
  return (
    <ProjectSocketProvider>
      <Project />
    </ProjectSocketProvider>
  );
}

export { ProjectWrapper, useProjectSocket };
