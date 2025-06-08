import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useProjectQueries } from "@/pages/projects/hooks/use-project-queries";

function ProjectDeleteAlertDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { project, deleteProject, deleteProjectPending } = useProjectQueries();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Подтвердите действие</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить проект?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отменить</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteProjectPending}
            onClick={() => {
              deleteProject({
                project_id: String(project?.id),
              });
              onOpenChange(false);
            }}
          >
            {deleteProjectPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Подтвердить"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ProjectDeleteAlertDialog };
