import { Navigate } from "react-router";
import { ROUTES } from "@/shared/constants/router";
import { useCheckAuth } from "@/shared/api";
import { Loader } from "@/shared/ui/loader";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isSuccess, isLoading } = useCheckAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  return isSuccess ? children : <Navigate to={ROUTES.auth} replace />;
}

export { RequireAuth };
