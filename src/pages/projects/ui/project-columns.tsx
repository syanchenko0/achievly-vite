import { useParams } from "react-router";
import { type ProjectColumn } from "@/shared/api";
import { DragDropProvider } from "@dnd-kit/react";
import { useEffect, useRef, useState } from "react";
import { move } from "@dnd-kit/helpers";
import { useProjectQueries } from "@/pages/projects/hooks/use-project-queries";
import { ProjectSortableColumn } from "@/pages/projects/ui/project-sortable-column";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";

function ProjectColumns({
  onCreateColumn,
  onOpenColumnEditDialog,
  onOpenForbiddenEditAlertDialog,
}: {
  onCreateColumn: () => void;
  onOpenColumnEditDialog: (column: ProjectColumn) => void;
  onOpenForbiddenEditAlertDialog: () => void;
}) {
  const { project_id } = useParams<{ project_id: string }>();

  const { project, updateProject } = useProjectQueries();

  const [columns, setColumns] = useState<ProjectColumn[]>(
    project?.columns ?? [],
  );

  const previousColumns = useRef<ProjectColumn[]>(columns);

  useEffect(() => {
    setColumns(project?.columns ?? []);
  }, [project?.columns]);

  return (
    <DragDropProvider
      onDragStart={() => {
        previousColumns.current = columns;
      }}
      onDragOver={(event) => {
        setColumns((prev) => move(prev, event));
      }}
      onDragEnd={(event) => {
        const { source } = event.operation;

        const currentColumnIndex = columns.findIndex(
          (column) => column.id === source?.id,
        );

        const previousColumnIndex = previousColumns.current.findIndex(
          (column) => column.id === source?.id,
        );

        if (!project?.user_project_rights?.update) {
          if (currentColumnIndex !== previousColumnIndex) {
            setColumns(previousColumns.current);
            onOpenForbiddenEditAlertDialog();
          }

          return;
        }

        if (currentColumnIndex !== previousColumnIndex) {
          updateProject({
            project_id: Number(project_id),
            data: {
              columns: columns.map((column, index) => ({
                ...column,
                order: index,
              })),
            },
          });
        }
      }}
    >
      <div className="flex size-full items-center gap-x-4">
        {columns.map((column, index) => (
          <ProjectSortableColumn
            key={column.id}
            index={index}
            column={column}
            onOpenColumnEditDialog={onOpenColumnEditDialog}
          />
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={onCreateColumn}>
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Добавить столбец</TooltipContent>
        </Tooltip>
      </div>
    </DragDropProvider>
  );
}

export { ProjectColumns };
