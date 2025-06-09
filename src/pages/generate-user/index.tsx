import { Textarea } from "@/shared/ui/textarea";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useGenerateGoals } from "@/shared/api";

function GenerateUser() {
  const [json, setJson] = useState<string>();

  const { mutateAsync: generateGoals } = useGenerateGoals();

  const handleGenerate = async () => {
    const object = JSON.parse(json || "{}");

    await generateGoals({
      data: JSON.stringify(object),
    });
  };

  return (
    <div className="bg-sidebar flex size-full flex-col gap-y-4 rounded-md border p-4">
      <div className="scroll flex min-h-0 flex-col gap-y-4 overflow-y-auto">
        <h3 className="text-base font-medium">Создание пользователя</h3>

        <Textarea onChange={(event) => setJson(event.target.value)} />

        <Button onClick={handleGenerate}>Запустить</Button>
      </div>
    </div>
  );
}

export { GenerateUser };
