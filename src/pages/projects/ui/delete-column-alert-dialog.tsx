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

function DeleteColumnAlertDialog({
  open,
  is_removable,
  has_rights,
  has_tasks,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  is_removable: boolean;
  has_rights: boolean;
  has_tasks: boolean;
  onConfirm: () => void;
  onOpenChange: (value: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {is_removable && has_rights && has_tasks && "Невозможно удалить"}
            {is_removable && has_rights && !has_tasks && "Подтвердите действие"}
            {is_removable && !has_rights && !has_tasks && "Недостаточно прав"}
          </AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col">
            {has_rights && has_tasks && is_removable && (
              <span>
                Столбец с задачами нельзя удалить. <br /> Перенесите задачи в
                другой столбец, чтобы удалить текущий столбец
              </span>
            )}
            {!has_rights && !has_tasks && (
              <span>
                У вас нет прав на удаление данных в проекте.
                <br />
                Запросите доступ у создателя проекта
              </span>
            )}
            {!is_removable && has_rights && (
              <span>
                Данный столбец нельзя удалить из-за его настроек. <br />
                Вы можете изменить настройки столбца, если у вас есть права на
                редактирование. <br />В ином случае, обратитесь к создателю
                проекта
              </span>
            )}
            {is_removable && has_rights && !has_tasks && (
              <span>Вы уверены, что хотите удалить столбец?</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Закрыть</AlertDialogCancel>
          {is_removable && has_rights && !has_tasks && (
            <AlertDialogAction onClick={onConfirm}>
              Подтвердить
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { DeleteColumnAlertDialog };
